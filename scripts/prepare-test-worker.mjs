import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const file = path.resolve("dist/server/wrangler.json");
const config = JSON.parse(readFileSync(file, "utf8"));
const databaseId = process.env.DIJI_TEST_D1_DATABASE_ID;
if (!databaseId || !/^[0-9a-f-]{36}$/i.test(databaseId)) {
  throw new Error("Set DIJI_TEST_D1_DATABASE_ID to the test database UUID.");
}
config.name = "dijirehber-test";
// Preserve variables and secrets set in Cloudflare dashboard on scripted deploys.
config.keep_vars = true;
config.d1_databases = [{
  binding: "DB",
  database_name: "dijirehber-test-db",
  database_id: databaseId
}];
// R2 hasn't been activated in this account. Don't deploy a placeholder binding.
config.r2_buckets = [];
writeFileSync(file, JSON.stringify(config, null, 2) + "\n");
console.log("Prepared test-only Worker configuration. No production resources targeted.");
