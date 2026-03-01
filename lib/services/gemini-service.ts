export interface GenerateMemeResult {
    dataUrl: string;
    url: string | null;
    mimeType: string;
}

export async function generateMemeImage(
    prompt: string,
    referenceImageFile?: File,
    authToken?: string,
    signal?: AbortSignal
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
        signal,
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
