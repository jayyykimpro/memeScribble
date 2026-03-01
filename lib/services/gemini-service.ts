export interface GenerateMemeResult {
    dataUrl: string;   // base64 data URL — always present, image renders immediately
    url: string | null; // R2 public URL — present only if R2 upload succeeded
    mimeType: string;
}

/**
 * Generates a Wojak-style meme. Returns base64 dataUrl immediately.
 * R2 upload happens server-side; url is null if R2 is unavailable.
 */
export async function generateMemeImage(
    prompt: string,
    referenceImageFile?: File,
    authToken?: string
): Promise<GenerateMemeResult> {
    const formData = new FormData();
    formData.append("prompt", prompt);

    if (referenceImageFile) {
        formData.append("image", referenceImageFile);
    }

    const headers: Record<string, string> = {};
    if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
    }

    const response = await fetch("/api/generate-meme", {
        method: "POST",
        headers,
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Image generation failed: ${response.status}`);
    }

    const data = await response.json();

    if (!data.dataUrl) {
        throw new Error("No image data returned from server.");
    }

    return {
        dataUrl: data.dataUrl,
        url: data.url ?? null,
        mimeType: data.mimeType ?? "image/png",
    };
}
