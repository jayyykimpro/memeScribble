import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export interface GeneratedImage {
    id: string;
    url: string;
    prompt: string | null;
    country_code: string | null;
    user_id: string;
    created_at: string;
    username?: string; // joined from users table
}

/** Trending memes — paginated, newest first, with username */
export async function fetchTrendingMemes(from: number, to: number): Promise<GeneratedImage[]> {
    const { data, error } = await supabase
        .from("generated_images")
        .select("id, url, prompt, country_code, user_id, created_at")
        .order("created_at", { ascending: false })
        .range(from, to);

    if (error) {
        console.error("Failed to fetch trending memes:", error);
        return [];
    }

    // Enrich with usernames (best-effort)
    const rows = data || [];
    const userIds = [...new Set(rows.map((r) => r.user_id).filter(Boolean))];
    let usernameMap: Record<string, string> = {};

    if (userIds.length > 0) {
        const { data: users } = await supabase
            .from("users")
            .select("id, username, email")
            .in("id", userIds);

        if (users) {
            usernameMap = Object.fromEntries(
                users.map((u) => [u.id, u.username || u.email?.split("@")[0] || "anon"])
            );
        }
    }

    return rows.map((r) => ({
        ...r,
        username: usernameMap[r.user_id] ?? "anon",
    }));
}

/** My memes — for sidebar gallery */
export async function fetchMyMemes(userId: string, from: number, to: number): Promise<GeneratedImage[]> {
    const { data, error } = await supabase
        .from("generated_images")
        .select("id, url, prompt, country_code, user_id, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .range(from, to);

    if (error) {
        console.error("Failed to fetch my memes:", error);
        return [];
    }

    return data || [];
}
