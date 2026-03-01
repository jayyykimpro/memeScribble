"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/context/auth-context";
import { useRouter } from "next/navigation";
import { PromptArea, GenerationStatus } from "@/components/main/prompt-area";
import { ImageGallery } from "@/components/ui/image-gallery";
import LoadingBottle from "@/components/ui/loading-bottle";

// ── Brick background ──
const ScribbleBricks = () => (
    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.10]" xmlns="http://www.w3.org/2000/svg">
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

// ── Error display ──
const ErrorDisplay = ({ message }: { message: string }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.7 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="flex flex-col items-center justify-center gap-5 py-4"
    >
        <svg viewBox="0 0 100 100" className="w-28 h-28" fill="none" stroke="black" strokeWidth="8" strokeLinecap="round">
            <circle cx="50" cy="50" r="44" strokeWidth="6" stroke="black" opacity="0.12" fill="black" fillOpacity="0.04" />
            <line x1="28" y1="28" x2="72" y2="72" />
            <line x1="72" y1="28" x2="28" y2="72" />
        </svg>
        <div className="text-center">
            <p className="text-base font-black text-black uppercase tracking-widest mb-1">Oops! Failed 💀</p>
            <p className="text-xs font-mono text-black/50 max-w-xs leading-relaxed">{message}</p>
        </div>
    </motion.div>
);

// ── Generated meme display with download ──
const MemeDisplay = ({ dataUrl }: { dataUrl: string }) => {
    const handleDownload = () => {
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = `meme-${Date.now()}.png`;
        a.click();
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ type: "spring", stiffness: 200, damping: 22 }}
            className="flex flex-col items-center gap-4"
        >
            {/* Meme image */}
            <div className="relative border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] rounded-xl overflow-hidden bg-white max-w-sm w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={dataUrl} alt="Generated meme" className="w-full h-auto" />

                {/* Download button overlay */}
                <button
                    onClick={handleDownload}
                    className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black text-white text-xs font-black uppercase tracking-widest px-3 py-2 rounded-lg shadow-[3px_3px_0_0_rgba(255,255,255,0.3)] hover:translate-y-[-1px] hover:shadow-[3px_4px_0_0_rgba(255,255,255,0.3)] active:translate-y-[1px] transition-all"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Download
                </button>
            </div>
            <p className="text-xs font-bold text-black/40 uppercase tracking-widest animate-pulse">
                ✨ Meme ready!
            </p>
        </motion.div>
    );
};

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [genStatus, setGenStatus] = React.useState<GenerationStatus>("idle");
    const [errorMsg, setErrorMsg] = React.useState<string>("");
    const [memeDataUrl, setMemeDataUrl] = React.useState<string | null>(null);
    const [galleryRefresh, setGalleryRefresh] = React.useState(0);

    React.useEffect(() => {
        if (!loading && !user) router.replace("/");
    }, [user, loading, router]);

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white font-mono">
                <p className="text-xl font-bold animate-pulse text-black">Loading...</p>
            </div>
        );
    }

    const isActive = genStatus !== "idle";

    return (
        <div className="relative min-h-screen w-full bg-white font-mono text-black overflow-x-hidden">
            <ScribbleBricks />

            {/* ── Status / Meme display panel ── */}
            <AnimatePresence>
                {isActive && (
                    <motion.div
                        key="status-panel"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 80, damping: 18 }}
                        className="relative z-10 flex items-center justify-center overflow-hidden pt-24 pb-6"
                    >
                        <AnimatePresence mode="wait">
                            {(genStatus === "generating" || genStatus === "uploading") && (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <LoadingBottle />
                                </motion.div>
                            )}

                            {genStatus === "error" && (
                                <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <ErrorDisplay message={errorMsg} />
                                </motion.div>
                            )}

                            {genStatus === "done" && memeDataUrl && (
                                <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <MemeDisplay dataUrl={memeDataUrl} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Prompt + Gallery ── */}
            <motion.div animate={{ y: 0 }} transition={{ type: "spring", stiffness: 80, damping: 18 }}>
                {/* Prompt area */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 80, damping: 16 }}
                    className={`relative z-10 flex flex-col items-center justify-center px-4 pb-12 ${isActive ? "pt-6" : "pt-32"} transition-all duration-500`}
                >
                    <PromptArea
                        isActive={isActive}
                        onStatusChange={(status, msg, imageDataUrl) => {
                            setGenStatus(status);
                            if (msg) setErrorMsg(msg);
                            if (imageDataUrl) setMemeDataUrl(imageDataUrl);
                            // 생성 완료 시 갤러리 새로고침
                            if (status === "done") setGalleryRefresh(n => n + 1);
                        }}
                    />
                </motion.div>

                {/* Trending Now gallery */}
                <div className="relative z-10 w-full px-4 md:px-8 pb-16">
                    <div className="mx-auto max-w-7xl">
                        <div className="flex items-center gap-3 mb-8">
                            <h2 className="text-2xl font-black uppercase tracking-widest text-black">Trending Now</h2>
                            <svg className="w-6 h-6 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                            <span className="text-sm font-bold text-black/50 italic">people making something..</span>
                        </div>
                        <ImageGallery refreshTrigger={galleryRefresh} />
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
