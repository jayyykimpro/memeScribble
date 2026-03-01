import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

export async function DELETE(req: NextRequest) {
    const memeId = req.nextUrl.searchParams.get("id");
    if (!memeId) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "");

    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: { user }, error: authError } = await admin.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Fetch the meme row to verify ownership
    const { data: meme, error: fetchError } = await admin
        .from("generated_images")
        .select("id, url, user_id")
        .eq("id", memeId)
        .single();

    if (fetchError || !meme) return NextResponse.json({ error: "Meme not found" }, { status: 404 });
    if (meme.user_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // Delete from Supabase DB
    await admin.from("generated_images").delete().eq("id", memeId);

    // Try delete from R2 (best-effort)
    try {
        const r2AccountId = process.env.R2_ACCOUNT_ID;
        const r2Key = process.env.R2_ACCESS_KEY_ID;
        const r2Secret = process.env.R2_SECRET_ACCESS_KEY;
        const r2Bucket = process.env.R2_BUCKET_NAME || "memescribble";
        const r2PublicUrl = process.env.R2_PUBLIC_URL || "";

        if (r2AccountId && r2Key && r2Secret && meme.url?.startsWith(r2PublicUrl)) {
            const objectKey = meme.url.replace(r2PublicUrl + "/", "");
            const s3 = new S3Client({
                region: "auto",
                endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
                credentials: { accessKeyId: r2Key, secretAccessKey: r2Secret },
            });
            await s3.send(new DeleteObjectCommand({ Bucket: r2Bucket, Key: objectKey }));
        }
    } catch (e) {
        console.warn("R2 delete failed (non-fatal):", e);
    }

    return NextResponse.json({ success: true });
}
