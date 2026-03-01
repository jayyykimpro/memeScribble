"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/context/auth-context";
import { useRouter } from "next/navigation";
import { PromptArea } from "@/components/main/prompt-area";
import { ImageGallery } from "@/components/ui/image-gallery";

// 스누피 벽돌 배경
const ScribbleBricks = () => (
    <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.10]"
        xmlns="http://www.w3.org/2000/svg"
    >
        <defs>
            <pattern id="dash-bricks" x="0" y="0" width="160" height="80" patternUnits="userSpaceOnUse">
                <path d="M -10 0 Q 30 3, 70 -2 T 170 1" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
                <path d="M -10 40 Q 20 38, 60 42 T 170 39" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
                <path d="M -10 80 Q 40 82, 80 78 T 170 81" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
                <path d="M 0 0 Q 2 15, -1 30 T 1 40" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
                <path d="M 80 0 Q 77 15, 82 25 T 80 40" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
                <path d="M 40 40 Q 42 55, 38 65 T 41 80" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
                <path d="M 120 40 Q 118 55, 123 65 T 120 80" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
            </pattern>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#dash-bricks)" />
    </svg>
);

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    React.useEffect(() => {
        if (!loading && !user) {
            router.replace("/");
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white font-mono">
                <p className="text-xl font-bold animate-pulse text-black">Loading...</p>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen w-full bg-white font-mono text-black">
            <ScribbleBricks />

            {/* 프롬프트 영역 (상단 배치) */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring" as const, stiffness: 80, damping: 16 }}
                className="relative z-10 flex flex-col items-center justify-center px-4 pt-32 pb-12"
            >
                <PromptArea />
            </motion.div>

            {/* 추천 밈 갤러리 영역 */}
            <div className="relative z-10 w-full px-4 md:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="flex items-center gap-3 mb-8">
                        <h2 className="text-2xl font-black uppercase tracking-widest text-black">
                            Trending Now
                        </h2>
                        <svg
                            className="w-6 h-6 animate-bounce"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                        <span className="text-sm font-bold text-black/50 italic">
                            people making something..
                        </span>
                    </div>

                    <ImageGallery />
                </div>
            </div>
        </div>
    );
}
