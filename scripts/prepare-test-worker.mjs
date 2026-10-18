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
// Bind R2 only after a real test bucket has been created and configured.
const bucketName = process.env.DIJI_TEST_R2_BUCKET_NAME || "";
if (bucketName && !/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(bucketName)) throw new Error("Invalid DIJI_TEST_R2_BUCKET_NAME");
config.r2_buckets = bucketName ? [{binding: "BUCKET", bucket_name: bucketName}] : [];
console.log(bucketName ? "Configured isolated test R2 bucket." : "R2 not configured; sponsor image upload will remain disabled.");
writeFileSync(file, JSON.stringify(config, null, 2) + "\n");
console.log("Prepared test-only Worker configuration. No production resources targeted.");
