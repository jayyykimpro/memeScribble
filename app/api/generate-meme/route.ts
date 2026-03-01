import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { createClient } from "@supabase/supabase-js";
import { WOJAK_SYSTEM_PROMPT } from "@/lib/systemprompt";

// ── Gemini ──────────────────────────────────────────────────────────
const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
if (!apiKey) throw new Error("GEMINI_API_KEY is not defined");
const ai = new GoogleGenAI({ apiKey });

// Confirmed working image generation model
const IMAGE_MODEL = "gemini-2.0-flash-exp-image-generation";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const prompt = (formData.get("prompt") as string) || "Make a funny wojak meme";
        const imageFile = formData.get("image") as File | null;
        const authHeader = req.headers.get("authorization") || "";
        const token = authHeader.replace("Bearer ", "");

        // ── 1. Identify user (optional, no crash if missing) ────────
        let userId: string | null = null;
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (token && supabaseUrl && serviceKey) {
            try {
                const admin = createClient(supabaseUrl, serviceKey);
                const { data: { user } } = await admin.auth.getUser(token);
                userId = user?.id ?? null;
            } catch { /* skip user lookup */ }
        }

        // ── 2. Build Gemini request ──────────────────────────────────
        // Use generateImages for image-specific model — no systemInstruction, no config
        const wojakPrompt = `Wojak meme, crude MS Paint style, shaky lines, asymmetric eyes, white background. ${prompt}`;

        const userParts: object[] = [
            { text: wojakPrompt },
        ];

        if (imageFile) {
            const arrayBuffer = await imageFile.arrayBuffer();
            const base64 = Buffer.from(arrayBuffer).toString("base64");
            userParts.push({
                inlineData: {
                    mimeType: imageFile.type || "image/jpeg",
                    data: base64,
                },
            });
        }

        // ── 2b. Call Gemini with retry (model can 500 intermittently) ──
        let response;
        let lastError: Error | null = null;
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                response = await ai.models.generateContent({
                    model: IMAGE_MODEL,
                    contents: [{ role: "user", parts: userParts }],
                    config: {
                        responseModalities: ["TEXT", "IMAGE"],
                    },
                });
                break; // success
            } catch (err) {
                lastError = err as Error;
                const isRetryable = lastError.message.includes("500") || lastError.message.includes("INTERNAL");
                if (!isRetryable || attempt === 3) throw lastError;
                const delay = attempt * 1500; // 1.5s, 3s
                console.warn(`Gemini attempt ${attempt} failed (${lastError.message}), retrying in ${delay}ms...`);
                await new Promise(r => setTimeout(r, delay));
            }
        }
        if (!response) throw lastError ?? new Error("Gemini generation failed");

        // ── 3. Extract image from response ───────────────────────────
        const candidates = response.candidates;
        if (!candidates || candidates.length === 0) {
            return NextResponse.json(
                { error: "Image generation failed: no candidates returned." },
                { status: 500 }
            );
        }

        const contentParts = candidates[0]?.content?.parts || [];
        let imageData: string | null = null;
        let mimeType = "image/png";

        for (const part of contentParts) {
            if (part.inlineData?.data) {
                imageData = part.inlineData.data;
                mimeType = part.inlineData.mimeType || "image/png";
                break;
            }
        }

        if (!imageData) {
            return NextResponse.json(
                { error: "The model did not return an image. Try a different prompt." },
                { status: 422 }
            );
        }

        // ── 4. Try R2 upload (best-effort, never crash) ──────────────
        let publicUrl: string | null = null;
        const r2AccountId = process.env.R2_ACCOUNT_ID;
        const r2Key = process.env.R2_ACCESS_KEY_ID;
        const r2Secret = process.env.R2_SECRET_ACCESS_KEY;
        const r2Bucket = process.env.R2_BUCKET_NAME || "memescribble";
        const r2PublicUrl = process.env.R2_PUBLIC_URL || "https://memescribble.com";

        if (r2AccountId && r2Key && r2Secret) {
            try {
                const s3 = new S3Client({
                    region: "auto",
                    endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
                    credentials: { accessKeyId: r2Key, secretAccessKey: r2Secret },
                });
                const ext = mimeType.split("/")[1] || "png";
                const fileName = `memes/${userId ?? "anon"}/${Date.now()}.${ext}`;
                const imageBuffer = Buffer.from(imageData, "base64");

                await s3.send(new PutObjectCommand({
                    Bucket: r2Bucket,
                    Key: fileName,
                    Body: imageBuffer,
                    ContentType: mimeType,
                }));

                publicUrl = `${r2PublicUrl}/${fileName}`;
                console.log("✅ R2 upload success:", publicUrl);

                // Save to DB if user is authenticated
                if (userId && supabaseUrl && serviceKey) {
                    const admin = createClient(supabaseUrl, serviceKey);
                    await admin.from("generated_images").insert({
                        url: publicUrl,
                        prompt,
                        country_code: "KR",
                        user_id: userId,
                    }).then(({ error }) => {
                        if (error) console.warn("DB insert warning:", error.message);
                    });
                }
            } catch (r2err) {
                console.warn("R2 upload failed (non-fatal):", (r2err as Error).message);
                // Continue without R2 — return data URL as fallback
            }
        }

        // ── 5. Return — always include base64 so image shows ─────────
        return NextResponse.json({
            success: true,
            // dataUrl: always present so UI can render the meme immediately
            dataUrl: `data:${mimeType};base64,${imageData}`,
            // url: present only if R2 upload succeeded
            url: publicUrl,
            mimeType,
        });

    } catch (err: unknown) {
        console.error("generate-meme error:", err);
        let message = err instanceof Error ? err.message : "Unknown error occurred.";

        if (message.includes("API key expired") || message.includes("API_KEY_INVALID")) {
            message = "API key expired or invalid.";
        } else if (message.includes("RESOURCE_EXHAUSTED") || message.includes("quota")) {
            message = "API quota exceeded. Try again later.";
        } else if (message.includes("NOT_FOUND") || message.includes("not found")) {
            message = "Model not found.";
        }

        return NextResponse.json({ error: message }, { status: 500 });
    }
}
