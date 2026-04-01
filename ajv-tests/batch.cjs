const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const REPO = "ajv-validator/ajv"; // <--- CHANGE THIS
const OUTPUT_DIR = "./github_data";

function ghQuery(extraArgs) {
    const cmd = `gh issue list --repo ${REPO} --limit 1000 --json number,title,body,labels,createdAt ${extraArgs}`;
    return JSON.parse(execSync(cmd, { maxBuffer: 50 * 1024 * 1024 }));
}

try {
    console.log("Fetching open issues...");
    const openIssues = ghQuery('--state open');

    console.log("Fetching first 1000 closed issues...");
    const closedPart1 = ghQuery('--state closed');

    let allIssues = [...openIssues, ...closedPart1];

    // Check if we hit the limit and need the remaining ~441
    if (closedPart1.length === 1000) {
        // Get the creation date of the oldest issue in the first batch
        const oldestDate = closedPart1[closedPart1.length - 1].createdAt;
        console.log(`Limit hit. Fetching closed issues created before ${oldestDate}...`);
        
        // Fetch issues created BEFORE the oldest one we have
        const closedPart2 = ghQuery(`--state closed --search "created:<${oldestDate}"`);
        allIssues = allIssues.concat(closedPart2);
    }

    console.log(`Processing ${allIssues.length} total issues...`);

    // Clean/Create Base Directory
    if (fs.existsSync(OUTPUT_DIR)) fs.rmSync(OUTPUT_DIR, { recursive: true });
    fs.mkdirSync(OUTPUT_DIR);

    allIssues.forEach(issue => {
        // Sanitize group name (replaces / with - to avoid broken paths)
        const labelNames = issue.labels.map(l => l.name).sort();
        const groupName = labelNames.length > 0 
            ? labelNames.join(' + ').replace(/\//g, '-') 
            : "no-labels";
        
        const groupPath = path.join(OUTPUT_DIR, groupName);
        if (!fs.existsSync(groupPath)) fs.mkdirSync(groupPath, { recursive: true });

        const fileName = `issue-${issue.number}.md`;
        const content = `# [${issue.number}] ${issue.title}\n\n${issue.body}`;
        fs.writeFileSync(path.join(groupPath, fileName), content);
    });

    console.log(`✅ Success! Collected ${allIssues.length} issues into ${OUTPUT_DIR}`);

} catch (err) {
    console.error("Error:", err.message);
}