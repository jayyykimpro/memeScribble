/**
 * R2 연동 테스트 스크립트
 * 실행: node test-r2.mjs
 *
 * 1. List objects (버킷 접근 테스트)
 * 2. Put object  (업로드 테스트)
 * 3. Head object (업로드 확인)
 * 4. Delete object (정리)
 */

import { readFileSync } from "fs";
import { S3Client, ListObjectsV2Command, PutObjectCommand, HeadObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

// ── .env.local 파싱 ───────────────────────────────────────────────
const envRaw = readFileSync(".env.local", "utf-8");
const env = Object.fromEntries(
    envRaw
        .split("\n")
        .filter(l => l.includes("=") && !l.startsWith("#"))
        .map(l => {
            const idx = l.indexOf("=");
            return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
        })
);

const R2_ACCOUNT_ID = env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = env.R2_BUCKET_NAME || "memescribble";
const R2_PUBLIC_URL = env.R2_PUBLIC_URL || "";

const endpoint = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

console.log("─────────────────────────────────────────");
console.log("  Cloudflare R2 Connection Test");
console.log("─────────────────────────────────────────");
console.log(`  Endpoint  : ${endpoint}`);
console.log(`  Bucket    : ${R2_BUCKET_NAME}`);
console.log(`  Access Key: ${R2_ACCESS_KEY_ID?.slice(0, 8)}...`);
console.log("─────────────────────────────────────────\n");

const s3 = new S3Client({
    region: "auto",
    endpoint,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
});

let passed = 0;
let failed = 0;

async function test(name, fn) {
    process.stdout.write(`[TEST] ${name} ... `);
    try {
        const result = await fn();
        console.log(`✅ PASS${result ? " → " + result : ""}`);
        passed++;
    } catch (err) {
        console.log(`❌ FAIL → ${err.message}`);
        failed++;
    }
}

// ── 테스트 실행 ────────────────────────────────────────────────────

// 1. 버킷 접근 (List)
await test("Bucket access (ListObjects)", async () => {
    const res = await s3.send(new ListObjectsV2Command({
        Bucket: R2_BUCKET_NAME,
        MaxKeys: 1,
    }));
    return `${res.KeyCount ?? 0} objects found`;
});

// 2. 파일 업로드 (Put)
const testKey = `__test__/${Date.now()}.txt`;
await test("Upload file (PutObject)", async () => {
    await s3.send(new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: testKey,
        Body: Buffer.from("MemeScribble R2 test file"),
        ContentType: "text/plain",
    }));
    return `key: ${testKey}`;
});

// 3. 업로드 확인 (Head)
await test("Verify upload (HeadObject)", async () => {
    const res = await s3.send(new HeadObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: testKey,
    }));
    return `size: ${res.ContentLength} bytes`;
});

// 4. Public URL 확인
if (R2_PUBLIC_URL) {
    await test("Public URL format", async () => {
        const url = `${R2_PUBLIC_URL}/${testKey}`;
        return url;
    });
}

// 5. 테스트 파일 삭제 (정리)
await test("Cleanup (DeleteObject)", async () => {
    await s3.send(new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: testKey,
    }));
    return "deleted";
});

// ── 결과 요약 ──────────────────────────────────────────────────────
console.log("\n─────────────────────────────────────────");
console.log(`  Result: ${passed} passed / ${failed} failed`);
if (failed === 0) {
    console.log("  🎉 R2 is correctly configured!");
} else {
    console.log("  ⚠️  Check your R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY.");
    console.log("  → Go to Cloudflare Dashboard → R2 → Manage R2 API Tokens");
    console.log("  → Create token with 'Object Read & Write' for the memescribble bucket");
}
console.log("─────────────────────────────────────────");
