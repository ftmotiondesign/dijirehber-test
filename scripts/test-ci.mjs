import {spawnSync} from 'node:child_process';
const tests=['api.cjs','stays.cjs','request-tracking.cjs','guest-experience.cjs','operations.cjs','hospitality-tenants.cjs','regional-files.cjs','explore-wide.cjs','explore-quality.cjs','explore-geography-media.cjs','explore-media-quality.cjs','sponsors.cjs','central-sponsors.cjs','trip-sponsors.cjs','guest-navigation-ui.mjs','explore-ui.mjs','sponsors-ui.mjs','operations-ui.mjs','hospitality-tenants-ui.mjs','slow-connection.mjs','live-explore-accordion.mjs'];
for(const test of tests){const r=spawnSync(process.execPath,['tests/'+test],{stdio:'inherit',timeout:90000});if(r.error)throw r.error;if(r.status!==0)process.exit(r.status||1)}
console.log(`PASS: ${tests.length} test suites`);
