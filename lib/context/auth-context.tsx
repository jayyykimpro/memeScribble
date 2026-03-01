"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface AuthContextValue {
    /** 현재 로그인된 유저 (없으면 null) */
    user: User | null;
    /** 세션 로딩 중 여부 */
    loading: boolean;
    /** 구글 OAuth 로그인 */
    signInWithGoogle: () => Promise<void>;
    /** 로그아웃 */
    signOut: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = React.useState<User | null>(null);
    const [loading, setLoading] = React.useState(true);
    const supabase = createClient();

    React.useEffect(() => {
        // 최초 세션 확인
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // 이후 세션 변경 감지 (로그인/로그아웃)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextValue {
    const ctx = React.useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
