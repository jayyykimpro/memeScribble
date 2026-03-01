"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GeneratedImage } from "@/lib/services/meme-service";

interface MemeModalProps {
    image: GeneratedImage | null;
    onClose: () => void;
}

export function MemeModal({ image, onClose }: MemeModalProps) {
    // ESC key closes modal
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    const handleDownload = () => {
        if (!image) return;
        const a = document.createElement("a");
        a.href = `/api/download?url=${encodeURIComponent(image.url)}`;
        a.download = `meme-${image.id}.png`;
        a.click();
    };

    return (
        <AnimatePresence>
            {image && (
                <motion.div
                    key="modal-bg"
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    {/* Dimmed backdrop */}
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

                    {/* Modal content */}
                    <motion.div
                        key="modal-card"
                        className="relative z-10 bg-white border-4 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)] rounded-2xl overflow-hidden max-w-lg w-full"
                        initial={{ scale: 0.8, y: 40, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.8, y: 40, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 26 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white border-2 border-black hover:bg-red-500 transition-colors"
                            title="Close"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Image */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={image.url} alt={image.prompt || "meme"} className="w-full h-auto max-h-[60vh] object-contain bg-neutral-50" />

                        {/* Info row */}
                        <div className="px-4 py-3 border-t-2 border-black bg-white">
                            <div className="flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                    <p className="text-xs font-black text-black uppercase tracking-widest">
                                        @{image.username ?? "anon"}
                                    </p>
                                    {image.prompt && (
                                        <p className="text-xs font-mono text-black/50 truncate mt-0.5">
                                            &quot;{image.prompt}&quot;
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={handleDownload}
                                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-black text-white text-xs font-black uppercase tracking-widest rounded-lg border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,0.3)] hover:translate-y-[-1px] hover:shadow-[3px_4px_0_0_rgba(0,0,0,0.3)] transition-all"
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                        <polyline points="7 10 12 15 17 10" />
                                        <line x1="12" y1="15" x2="12" y2="3" />
                                    </svg>
                                    Download
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
