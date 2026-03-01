"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// 구글 로그인 가이드라인(GSI) 규격에 맞춘 공식 스타일 버튼 컴포넌트
const GoogleSignInButton = ({ onClick }: { onClick: () => void }) => (
    <button
        type="button"
        onClick={onClick}
        className="mt-4 flex w-full items-center justify-center h-10 px-3 bg-white border border-[#747775] rounded-[4px] transition-colors focus:outline-none focus:ring-2 focus:ring-[#4285f4] hover:bg-[#f8fafa] active:bg-[#f3f4f6]"
    >
        <div className="flex items-center justify-center">
            <div className="flex items-center justify-center w-[18px] h-[18px] mr-3">
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
            </div>
            <span className="text-[#1f1f1f] text-[14px] font-medium font-sans tracking-[0.25px]">Continue with Google</span>
        </div>
    </button>
);

// 스누피 벽돌 배경 (랜딩 페이지와 동일하게)
const ScribbleBricks = () => (
    <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.10]"
        xmlns="http://www.w3.org/2000/svg"
    >
        <defs>
            <pattern id="auth-bricks" x="0" y="0" width="160" height="80" patternUnits="userSpaceOnUse">
                <path d="M -10 0 Q 30 3, 70 -2 T 170 1" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
                <path d="M -10 40 Q 20 38, 60 42 T 170 39" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
                <path d="M -10 80 Q 40 82, 80 78 T 170 81" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
                <path d="M 0 0 Q 2 15, -1 30 T 1 40" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
                <path d="M 80 0 Q 77 15, 82 25 T 80 40" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
                <path d="M 40 40 Q 42 55, 38 65 T 41 80" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
                <path d="M 120 40 Q 118 55, 123 65 T 120 80" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
            </pattern>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#auth-bricks)" />
    </svg>
);

// 하찮은 작은 웃음 캐릭터 (로그인 페이지용 소형 버전)
const TinyDerpyFace = () => (
    <svg viewBox="0 0 80 80" className="w-20 h-20 mx-auto mb-6" xmlns="http://www.w3.org/2000/svg">
        {/* 흐물거리는 얼굴 */}
        <path
            d="M 38 8 Q 65 5, 70 35 Q 73 60, 48 70 Q 20 76, 10 50 Q 2 28, 20 14 Q 28 8, 38 8 Z"
            fill="white" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
        />
        {/* 왼쪽 눈 (큰 것) */}
        <ellipse cx="28" cy="32" rx="7" ry="8" fill="white" stroke="black" strokeWidth="2.5" transform="rotate(-10 28 32)" />
        <circle cx="29" cy="33" r="2.5" fill="black" />
        {/* 오른쪽 눈 (작은 것, 짝짝이) */}
        <ellipse cx="50" cy="30" rx="5" ry="6" fill="white" stroke="black" strokeWidth="2.5" transform="rotate(15 50 30)" />
        <circle cx="49" cy="31" r="2" fill="black" />
        {/* 코 */}
        <path d="M 37 38 Q 34 45, 40 47" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" />
        {/* 입 (하트 없이 납작하게) */}
        <path d="M 24 56 Q 40 50, 55 58" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" />
        {/* 이마 땀 */}
        <circle cx="62" cy="15" r="3" fill="none" stroke="black" strokeWidth="1.5" />
        <path d="M 62 12 L 62 6" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

// 구불구불한 장식선
const ScribbleDivider = () => (
    <svg viewBox="0 0 300 12" className="w-full my-4" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M 0 6 Q 30 2, 60 6 T 120 6 T 180 6 T 240 6 T 300 6"
            fill="none" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.3"
        />
    </svg>
);

export default function AuthPage() {
    const { user, loading, signInWithGoogle } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            router.replace("/dashboard");
        }
    }, [user, loading, router]);

    if (loading || user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white font-mono">
                <p className="text-xl font-bold animate-pulse text-black">Checking vibe...</p>
            </div>
        );
    }

    return (
        <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-white font-mono text-black px-4">
            {/* 스누피 벽돌 배경 */}
            <ScribbleBricks />

            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring" as const, stiffness: 80, damping: 14 }}
                className="relative z-10 w-full max-w-sm"
            >
                {/* 로그인 카드 */}
                <div className="rounded-2xl border-2 border-black bg-white p-8 shadow-[6px_6px_0_0_rgba(0,0,0,1)]">

                    {/* 하찮은 캐릭터 */}
                    <TinyDerpyFace />

                    {/* 타이틀 */}
                    <div className="mb-2 text-center">
                        <h1 className="text-4xl font-black uppercase tracking-tight text-black"
                            style={{ textShadow: "-1px -1px 0 black, 1px -1px 0 black, -1px 1px 0 black, 1px 1px 0 black, 3px 3px 0 rgba(0,0,0,0.1)" }}
                        >
                            Meme me
                        </h1>
                        <p className="mt-2 text-sm font-bold text-black/60">
                            Login to make it.
                        </p>
                    </div>

                    <ScribbleDivider />

                    {/* 구글 로그인 버튼 */}
                    <GoogleSignInButton onClick={signInWithGoogle} />

                    {/* 약관 안내 */}
                    <p className="mt-6 text-center text-[11px] font-bold text-black/40 leading-relaxed">
                        By continuing, you agree to our
                        <br />Terms of Service and Privacy Policy
                    </p>
                </div>

                {/* 홈으로 돌아가기 */}
                <div className="mt-5 text-center">
                    <Link
                        href="/"
                        className="text-xs font-bold uppercase tracking-widest text-black underline decoration-wavy underline-offset-4 hover:text-black/60 transition-colors"
                    >
                        ← Back to Home
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
