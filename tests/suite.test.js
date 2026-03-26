import { describe, test, expect } from "bun:test";
import fs from "fs";
import path from "path";

import { CompoundSchema } from "../src/internal/schema.js";
import { compile } from "../src/internal/ast.js";
import { catalog } from "../src/internal/catalog.js";

const cat = catalog();
const { validate } = cat;

const __dirname = import.meta.dir;

const SUPPORTED_DRAFTS = ["draft2020-12", "draft2019-09", "draft-07", "draft-06", "draft-04"];

const SUITE_DIR = path.resolve(__dirname, "suite/tests");
const REMOTE_DIR = path.resolve(__dirname, "suite/remotes");

const SPECS_DIR = path.resolve(__dirname, "specs");

/**
 * 
 * @param {string} draft 
 */
function getTestFolder(draft) {
    switch (draft) {
        case "draft2020-12":
            return "draft2020-12";
        case "draft2019-09":
            return "draft2019-09";
        case "draft-07":
            return "draft7";
        case "draft-06":
            return "draft6";
        case "draft-04":
            return "draft4";
    }
    throw new Error("Not implemented");
}

/**
 * Recursively reads all JSON files in a directory.
 * @param {string} rootDir 
 * @returns {Array<{path: string, schema: any}>}
 */
function readDirRecursive(rootDir) {
    let files = [];
    function readDir(dirName) {
        const content = fs.readdirSync(dirName);
        for (const file of content) {
            const abspath = path.join(dirName, file);
            const stats = fs.statSync(abspath);
            if (stats.isDirectory()) {
                readDir(abspath);
            } else if (file.endsWith('.json')) {
                const contentStr = fs.readFileSync(abspath, "utf8");
                // Get path relative to the root 'remotes' folder
                const relativePath = path.relative(rootDir, abspath);
                files.push({ path: relativePath, schema: JSON.parse(contentStr) });
            }
        }
    }
    readDir(rootDir); // Kick off the recursion
    return files;
}

const REMOTE_FILES = readDirRecursive(REMOTE_DIR);

for (const draft of SUPPORTED_DRAFTS) {
    const draftFolder = getTestFolder(draft);

    const suiteDir = path.join(SUITE_DIR, draftFolder);

    if (!fs.existsSync(suiteDir)) {
        throw new Error(`${draft} - test folder not found.`);
    }

    const allFiles = fs.readdirSync(suiteDir).filter(f => f.endsWith('.json'));
    
    const draftRemoteDir = path.resolve(REMOTE_DIR, draftFolder)


    let vocabSchemas = [];

    const specDir = path.join(SPECS_DIR, draft);
    const rootSchemaPath = path.join(specDir, "schema.json");

    const rootMetaSchema = JSON.parse(fs.readFileSync(rootSchemaPath, "utf8"));
    let rootMetaUri = rootMetaSchema.$id || rootMetaSchema.id || `https://json-schema.org/${draft}/schema`;

    // Look at the allOf clause to figure out which meta schemas to load
    if (Array.isArray(rootMetaSchema.allOf)) {
        for (const branch of rootMetaSchema.allOf) {
            // Look for relative refs like "meta/core" or "meta/validation"
            if (branch.$ref && branch.$ref.startsWith("meta/")) {
                const vocabFileName = branch.$ref.replace("meta/", "") + ".json";
                const vocabPath = path.join(specDir, "meta", vocabFileName);

                if (fs.existsSync(vocabPath)) {
                    const vocabSchema = JSON.parse(fs.readFileSync(vocabPath, "utf8"));
                    const vocabUri = vocabSchema.$id || vocabSchema.id;
                    if (vocabUri) {
                        vocabSchemas.push({ schema: vocabSchema, uri: vocabUri });
                    }
                } else {
                    console.warn(`⚠️ Missing vocabulary file: ${vocabPath}`);
                }
            }
        }
    }

    describe(`JSON Schema: ${draft}`, () => {
        for (const file of allFiles) {
            const filePath = path.join(suiteDir, file);
            const testGroups = JSON.parse(fs.readFileSync(filePath, "utf8"));

            describe(`File: ${file}`, () => {
                for (const group of testGroups) {
                    describe(group.description, () => {
                        let compiledRoot;
                        let compileError = null;

                        // 1. Compile the schema ONCE per group
                        try {
                            const compound = new CompoundSchema(draft);
                            compound.add(rootMetaSchema, rootMetaUri);
                            for (const vocab of vocabSchemas) {
                                compound.add(vocab.schema, vocab.uri);
                            }

                            // Inject all remotes into this specific compound instance
                            for (const remoteFile of REMOTE_FILES) {
                                const uriPath = remoteFile.path.split(path.sep).join('/');
                                const uri = `http://localhost:1234/${uriPath}`;
                                compound.add(remoteFile.schema, uri);
                            }
                            const ref = compound.add(group.schema);
                            const ast = compound.bundle(ref);
                            const compiled = compile(cat, ast);
                            compiledRoot = compiled[0].schema;
                        } catch (err) {
                            compileError = err;
                        }

                        // 2. Loop through every payload test
                        for (const testCase of group.tests) {
                            test(testCase.description, () => {
                                if (compileError) {
                                    throw new Error(
                                        `Parser/Compiler failed: ${compileError.message}\n` +
                                        `Schema: ${JSON.stringify(group.schema)}`
                                    );
                                }

                                // 3. The Max Squeeze Validation
                                const isValid = validate(testCase.data, compiledRoot);
                                expect(isValid).toBe(testCase.valid);
                            });
                        }
                    });
                }
            });
        }
    });
}