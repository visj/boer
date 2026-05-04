import { describe, test, expect } from 'bun:test';
import { STRING, NUMBER, BOOLEAN } from '@boer/core';
import { catalog } from '@boer/validate';
import { allocators } from '@boer/builder';
import { print, dump, load } from '@boer/inspect';
import { compile } from '@boer/compiler';
import { CompoundSchema } from '@boer/schema';
import fs from 'fs';
import path from 'path';


// ========== JSON Schema suite dump/reload compliance ==========

describe('dump/reload — JSON Schema suite compliance', () => {
    const __dirname = import.meta.dir;
    const SUITE_DIR = path.resolve(__dirname, '../../schema/tests/suite/tests');
    const REMOTE_DIR = path.resolve(__dirname, '../../schema/tests/suite/remotes');
    const SPECS_DIR = path.resolve(__dirname, '../../schema/tests/specs');

    const SUPPORTED_DRAFTS = ['draft-04', 'draft-06', 'draft-07', 'draft2019-09', 'draft2020-12'];

    /**
     * @param {string} draft
     * @returns {string}
     */
    function getTestFolder(draft) {
        switch (draft) {
            case 'draft2020-12': return 'draft2020-12';
            case 'draft2019-09': return 'draft2019-09';
            case 'draft-07': return 'draft7';
            case 'draft-06': return 'draft6';
            case 'draft-04': return 'draft4';
        }
        throw new Error('Not implemented');
    }

    /**
     * Recursively reads all JSON files in a directory.
     * @param {string} rootDir
     * @returns {!Array<{path: string, schema: *}>}
     */
    function readDirRecursive(rootDir) {
        let files = [];
        function readDir(dirName) {
            let content = fs.readdirSync(dirName);
            for (let file of content) {
                let abspath = path.join(dirName, file);
                let stats = fs.statSync(abspath);
                if (stats.isDirectory()) {
                    readDir(abspath);
                } else if (file.endsWith('.json')) {
                    let str = fs.readFileSync(abspath, 'utf8');
                    let relativePath = path.relative(rootDir, abspath);
                    files.push({ path: relativePath, schema: JSON.parse(str) });
                }
            }
        }
        readDir(rootDir);
        return files;
    }

    let remoteFiles = readDirRecursive(REMOTE_DIR);

    for (let draft of SUPPORTED_DRAFTS) {
        let draftFolder = getTestFolder(draft);
        let suiteDir = path.join(SUITE_DIR, draftFolder);

        if (!fs.existsSync(suiteDir)) {
            continue;
        }

        let allFiles = fs.readdirSync(suiteDir).filter(f => f.endsWith('.json'));

        let specDir = path.join(SPECS_DIR, draft);
        let rootMetaSchema = JSON.parse(fs.readFileSync(path.join(specDir, 'schema.json'), 'utf8'));
        let rootMetaUri = rootMetaSchema.$id || rootMetaSchema.id || `https://json-schema.org/${draft}/schema`;

        let vocabSchemas = [];
        if (Array.isArray(rootMetaSchema.allOf)) {
            for (let branch of rootMetaSchema.allOf) {
                if (branch.$ref && branch.$ref.startsWith('meta/')) {
                    let vocabFileName = branch.$ref.replace('meta/', '') + '.json';
                    let vocabPath = path.join(specDir, 'meta', vocabFileName);
                    if (fs.existsSync(vocabPath)) {
                        let vocabSchema = JSON.parse(fs.readFileSync(vocabPath, 'utf8'));
                        let vocabUri = vocabSchema.$id || vocabSchema.id;
                        if (vocabUri) {
                            vocabSchemas.push({ schema: vocabSchema, uri: vocabUri });
                        }
                    }
                }
            }
        }

        describe(`Dump/Reload: ${draft}`, () => {
            /**
             * Phase 1: compile all schemas into a single catalog,
             * collecting the compiled roots and test data.
             */
            let originalCat = catalog();
            let compiledGroups = [];

            for (let file of allFiles) {
                let filePath = path.join(suiteDir, file);
                let testGroups = JSON.parse(fs.readFileSync(filePath, 'utf8'));

                for (let group of testGroups) {
                    try {
                        let compound = new CompoundSchema(draft);
                        compound.add(structuredClone(rootMetaSchema), rootMetaUri);
                        for (let vocab of vocabSchemas) {
                            compound.add(structuredClone(vocab.schema), vocab.uri);
                        }
                        for (let remoteFile of remoteFiles) {
                            let uriPath = remoteFile.path.split(path.sep).join('/');
                            let uri = `http://localhost:1234/${uriPath}`;
                            compound.add(structuredClone(remoteFile.schema), uri);
                        }
                        let ref = compound.add(group.schema);
                        let ast = compound.bundle(ref);
                        let compiled = compile(originalCat, ast);
                        compiledGroups.push({
                            file,
                            description: group.description,
                            compiledRoot: compiled[0].schema,
                            tests: group.tests,
                        });
                    } catch (err) {
                        /* Skip groups that fail to compile — the main suite.test.js handles those */
                    }
                }
            }

            /**
             * Phase 2: dump the catalog, reload into a fresh catalog,
             * and validate every test case against the reloaded catalog.
             */
            let bin = dump(originalCat);
            let reloadedCat = catalog(load(bin));

            for (let group of compiledGroups) {
                describe(`${group.file} — ${group.description}`, () => {
                    for (let tc of group.tests) {
                        test(tc.description, () => {
                            let isValid = reloadedCat.validate(tc.data, group.compiledRoot);
                            expect(isValid).toBe(tc.valid);
                        });
                    }
                });
            }
        });
    }
});
