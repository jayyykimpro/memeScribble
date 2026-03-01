"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchMyMemes, type GeneratedImage } from "@/lib/services/meme-service";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const supabase = createClient();
const PAGE_SIZE = 10;

const IconChevronLeft = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M15 18l-6-6 6-6" />
    </svg>
);
const IconChevronRight = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M9 18l6-6-6-6" />
    </svg>
);

interface MySidebarProps {
    refreshTrigger?: number;
    deletedIds?: Set<string>;
    onDeleteSync?: (id: string) => void;
}

export function MySidebar({ refreshTrigger = 0, deletedIds = new Set<string>(), onDeleteSync }: MySidebarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [images, setImages] = useState<GeneratedImage[]>([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setUserId(data.session?.user?.id ?? null);
        });
    }, []);

    // Reset when new meme is generated
    useEffect(() => {
        if (refreshTrigger > 0) {
            setImages([]);
            setPage(0);
            setHasMore(true);
        }
    }, [refreshTrigger]);

    const loadMore = useCallback(async () => {
        if (!userId || isLoading || !hasMore) return;
        setIsLoading(true);
        try {
            const from = page * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;
            const newImages = await fetchMyMemes(userId, from, to);
            if (newImages.length < PAGE_SIZE) setHasMore(false);
            setImages(prev => {
                const ids = new Set(prev.map(i => i.id));
                return [...prev, ...newImages.filter(i => !ids.has(i.id))];
            });
            setPage(prev => prev + 1);
        } finally {
            setIsLoading(false);
        }
    }, [userId, page, isLoading, hasMore]);

    // Load when sidebar opens or trigger changes
    useEffect(() => {
        if (isOpen && userId && images.length === 0) loadMore();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, userId, refreshTrigger]);

    const handleDelete = async (imageId: string) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const res = await fetch(`/api/delete-meme?id=${imageId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.ok) {
            setImages(prev => prev.filter(img => img.id !== imageId));
            onDeleteSync?.(imageId); // notify gallery
        }
    };

    // Filter out externally-deleted items (from gallery)
    const visibleImages = images.filter(img => !deletedIds.has(img.id));

    const handleDownload = (image: GeneratedImage) => {
        const a = document.createElement("a");
        a.href = `/api/download?url=${encodeURIComponent(image.url)}`;
        a.download = `meme-${image.id}.png`;
        a.click();
    };

    return (
        <>
            {/* Toggle tab — always visible on left edge */}
            <button
                onClick={() => setIsOpen(v => !v)}
                className="fixed left-0 top-1/2 -translate-y-1/2 z-40 flex items-center gap-1.5 bg-black text-white border-2 border-black px-2 py-4 rounded-r-xl shadow-[4px_4px_0_0_rgba(0,0,0,0.3)] hover:bg-neutral-800 transition-all"
                title={isOpen ? "Close my gallery" : "My gallery"}
            >
                {isOpen ? <IconChevronLeft /> : <IconChevronRight />}
                <span className="text-xs font-black tracking-widest uppercase" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
                    My History
                </span>
            </button>

            {/* Sidebar panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.aside
                        key="sidebar"
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed left-0 top-0 bottom-0 z-30 w-72 bg-white border-r-4 border-black shadow-[8px_0_0_0_rgba(0,0,0,0.04)] overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-4 border-b-2 border-black bg-black text-white">
                            <h2 className="text-sm font-black uppercase tracking-widest">My History</h2>
                            <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white transition-colors">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Image list */}
                        <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin">
                            {images.length === 0 && !isLoading && (
                                <div className="flex flex-col items-center justify-center py-10 text-center">
                                    <p className="text-sm font-black text-black/30 uppercase tracking-widest">No zzals yet</p>
                                    <p className="text-xs font-mono text-black/20 mt-1">Generate one above!</p>
                                </div>
                            )}

                            {visibleImages.map(image => (
                                <SidebarCard
                                    key={image.id}
                                    image={image}
                                    onDelete={() => handleDelete(image.id)}
                                    onDownload={() => handleDownload(image)}
                                />
                            ))}

                            {isLoading && (
                                <div className="h-24 rounded-xl border-2 border-black/20 bg-neutral-100 animate-pulse" />
                            )}

                            {hasMore && !isLoading && images.length > 0 && (
                                <button
                                    onClick={loadMore}
                                    className="w-full py-2 text-xs font-black uppercase tracking-widest border-2 border-black rounded-xl hover:bg-black hover:text-white transition-all"
                                >
                                    Load more
                                </button>
                            )}
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Backdrop on mobile */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        key="sidebar-bg"
                        className="fixed inset-0 z-20 bg-black/30 lg:hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                    />
                )}
            </AnimatePresence>
        </>
    );
}

function SidebarCard({ image, onDelete, onDownload }: {
    image: GeneratedImage;
    onDelete: () => void;
    onDownload: () => void;
}) {
    const [deleting, setDeleting] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Delete this zzal?")) return;
        setDeleting(true);
        await onDelete();
    };

    return (
        <div className={cn(
            "group relative overflow-hidden rounded-xl border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] bg-neutral-50 transition-all hover:-translate-y-0.5 hover:shadow-[2px_4px_0_0_rgba(0,0,0,1)]",
            deleting && "opacity-40 pointer-events-none"
        )}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={image.url}
                alt={image.prompt || "My meme"}
                className={cn("w-full h-auto object-cover transition-opacity duration-300", isLoaded ? "opacity-100" : "opacity-0")}
                onLoad={() => setIsLoaded(true)}
                loading="lazy"
            />
            {!isLoaded && <div className="h-32 bg-neutral-100 animate-pulse" />}

            {/* Prompt */}
            {image.prompt && (
                <div className="px-2 py-1.5 border-t-2 border-black bg-white">
                    <p className="text-xs font-mono text-black/50 truncate">&quot;{image.prompt}&quot;</p>
                </div>
            )}

            {/* Hover actions */}
            <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={(e) => { e.stopPropagation(); onDownload(); }}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-white border-2 border-black hover:bg-black hover:text-white transition-colors shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
                    title="Download"
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                </button>
                <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-white border-2 border-black hover:bg-red-500 hover:border-red-500 hover:text-white transition-colors shadow-[2px_2px_0_0_rgba(0,0,0,1)] disabled:opacity-40"
                    title="Delete"
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14H6L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4h6v2" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
