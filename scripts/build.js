import { execSync } from 'child_process';
import path from 'path';

const root = process.cwd();

/**
 * Build stages in topological dependency order.
 * Packages within the same stage can be built in parallel,
 * but we run them sequentially for simplicity and clearer logs.
 */
const stages = [
    ['core', 'inspect'],
    ['validate', 'builder', 'diagnose'],
    ['schema'],
    ['compiler'],
    ['boer'],
];

const totalStages = stages.flat().length;

let total = 0;
for (const stage of stages) {
    for (const pkg of stage) {
        total++;
        const pkgDir = path.resolve(root, 'packages', pkg);
        console.log(`[${total}/${totalStages}] Building ${pkg}...`);
        execSync('bun scripts/build.js', { cwd: pkgDir, stdio: 'inherit' });
    }
}

console.log(`\nSuccess! Built ${total} packages.`);
