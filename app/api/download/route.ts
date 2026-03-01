import { NextRequest, NextResponse } from "next/server";

/**
 * Download proxy — fetches the image server-side and returns it
 * so the browser doesn't hit CORS restrictions on external R2 URLs.
 *
 * Usage: GET /api/download?url=https://memescribble.com/memes/...
 */
export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get("url");
    if (!url) {
        return new NextResponse("Missing url parameter", { status: 400 });
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            return new NextResponse(`Upstream error: ${response.status}`, { status: response.status });
        }

        const contentType = response.headers.get("content-type") || "image/png";
        const buffer = await response.arrayBuffer();

        // Extract filename from URL
        const filename = url.split("/").pop() || "meme.png";

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                "Content-Type": contentType,
                "Content-Disposition": `attachment; filename="${filename}"`,
                "Cache-Control": "public, max-age=86400",
            },
        });
    } catch (err) {
        console.error("Download proxy error:", err);
        return new NextResponse("Failed to fetch image", { status: 500 });
    }
}
