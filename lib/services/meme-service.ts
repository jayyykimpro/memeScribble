import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

interface UploadMemeResult {
    success: boolean;
    url: string;
    image: {
        id: string;
        url: string;
        prompt: string;
        country_code: string;
        user_id: string;
        created_at: string;
    };
}

interface GeneratedImage {
    id: string;
    url: string;
    prompt: string | null;
    country_code: string | null;
    user_id: string;
    created_at: string;
}

/**
 * Edge Function을 통해 R2에 밈 이미지를 업로드합니다.
 * 프론트엔드에서 R2 키를 직접 사용하지 않습니다.
 */
export async function uploadMeme(
    file: Blob,
    prompt: string,
    countryCode: string = "KR"
): Promise<UploadMemeResult> {
    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
        throw new Error("로그인이 필요합니다.");
    }

    const formData = new FormData();
    formData.append("file", file, "meme.png");
    formData.append("prompt", prompt);
    formData.append("country_code", countryCode);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const response = await fetch(`${supabaseUrl}/functions/v1/upload-meme`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Upload failed: ${response.status}`);
    }

    return response.json();
}

/**
 * 트렌딩 밈 갤러리 데이터를 가져옵니다 (페이지네이션 지원).
 */
export async function fetchTrendingMemes(
    from: number,
    to: number
): Promise<GeneratedImage[]> {
    const { data, error } = await supabase
        .from("generated_images")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, to);

    if (error) {
        console.error("Failed to fetch trending memes:", error);
        return [];
    }

    return data || [];
}

export type { GeneratedImage, UploadMemeResult };
