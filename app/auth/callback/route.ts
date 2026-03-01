import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
            return NextResponse.redirect(`${origin}/dashboard`);
        }
    }

    // 에러 발생 시 auth 페이지로 돌아가기
    return NextResponse.redirect(`${origin}/auth?error=auth_failed`);
}
