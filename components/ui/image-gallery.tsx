'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useInView } from 'react-intersection-observer';
import { fetchTrendingMemes, type GeneratedImage } from '@/lib/services/meme-service';
import { MemeModal } from '@/components/ui/meme-modal';
import { createClient } from '@/lib/supabase/client';

const PAGE_SIZE = 12;

const supabase = createClient();

function PotatoSkeleton() {
    return (
        <div className="w-full mb-5 overflow-hidden rounded-xl border-2 border-black/20 bg-neutral-100 animate-pulse" style={{ height: 220 }}>
            <div className="flex items-center justify-center h-full">
                <span className="text-xs font-black text-black/20 uppercase tracking-widest">loading...</span>
            </div>
        </div>
    );
}

export function ImageGallery({
    refreshTrigger = 0,
    deletedIds = new Set<string>(),
    onDeleteSync,
}: {
    refreshTrigger?: number;
    deletedIds?: Set<string>;
    onDeleteSync?: (id: string) => void;
}) {
    const [images, setImages] = useState<GeneratedImage[]>([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);
    const [modalImage, setModalImage] = useState<GeneratedImage | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const loadingRef = useRef(false);

    // Get current user
    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setCurrentUserId(data.session?.user?.id ?? null);
        });
    }, []);

    // Reset when refreshTrigger changes
    useEffect(() => {
        setImages([]);
        setPage(0);
        setHasMore(true);
        setInitialLoad(true);
    }, [refreshTrigger]);

    const { ref: sentinelRef, inView } = useInView({ threshold: 0, rootMargin: '400px' });

    const loadMore = useCallback(async () => {
        if (loadingRef.current || !hasMore) return;
        loadingRef.current = true;
        setIsLoading(true);
        try {
            const from = page * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;
            const newImages = await fetchTrendingMemes(from, to);
            if (newImages.length < PAGE_SIZE) setHasMore(false);
            setImages(prev => {
                const existingIds = new Set(prev.map(img => img.id));
                return [...prev, ...newImages.filter(img => !existingIds.has(img.id))];
            });
            setPage(prev => prev + 1);
        } catch (err) {
            console.error('Failed to load memes:', err);
        } finally {
            loadingRef.current = false;
            setIsLoading(false);
            setInitialLoad(false);
        }
    }, [page, hasMore]);

    // Initial load after reset
    useEffect(() => {
        if (initialLoad) loadMore();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialLoad]);

    // Infinite scroll trigger
    useEffect(() => {
        if (inView && !isLoading && hasMore && !initialLoad) loadMore();
    }, [inView, isLoading, hasMore, initialLoad, loadMore]);

    const handleDelete = async (imageId: string) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const res = await fetch(`/api/delete-meme?id=${imageId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.ok) {
            setImages(prev => prev.filter(img => img.id !== imageId));
            onDeleteSync?.(imageId); // notify sidebar
        }
    };

    // Also filter out externally-deleted images (from sidebar)
    const visibleImages = images.filter(img => !deletedIds.has(img.id));

    if (!initialLoad && images.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-lg font-black text-black/40 uppercase tracking-widest">No memes yet...</p>
                <p className="text-sm font-bold text-black/30 mt-2">Be the first to create one! ↑</p>
            </div>
        );
    }

    return (
        <>
            {/* Modal */}
            <MemeModal image={modalImage} onClose={() => setModalImage(null)} />

            {/*
             * CSS columns masonry layout — browser handles height balancing automatically.
             * No more i%4 column assignment causing unequal heights.
             */}
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5 w-full">
                {visibleImages.map(image => (
                    <MemeCard
                        key={image.id}
                        image={image}
                        isOwner={currentUserId === image.user_id}
                        onOpen={() => setModalImage(image)}
                        onDelete={() => handleDelete(image.id)}
                    />
                ))}

                {/* Skeleton loaders appended inline for masonry */}
                {isLoading && Array.from({ length: 4 }).map((_, i) => (
                    <PotatoSkeleton key={`skel-${i}`} />
                ))}
            </div>

            {hasMore && <div ref={sentinelRef} className="h-10 w-full" />}

            {!hasMore && images.length > 0 && (
                <p className="mt-8 text-center text-sm font-bold text-black/30 uppercase tracking-widest">— that&apos;s all folks —</p>
            )}
        </>
    );
}

interface MemeCardProps {
    image: GeneratedImage;
    isOwner: boolean;
    onOpen: () => void;
    onDelete: () => void;
}

function MemeCard({ image, isOwner, onOpen, onDelete }: MemeCardProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation();
        const a = document.createElement('a');
        a.href = `/api/download?url=${encodeURIComponent(image.url)}`;
        a.download = `meme-${image.id}.png`;
        a.click();
    };

    const handleDeleteClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Delete this meme?')) return;
        setDeleting(true);
        await onDelete();
    };

    return (
        /* break-inside-avoid keeps each card in one column */
        <div
            className="break-inside-avoid mb-5 group relative overflow-hidden rounded-xl border-2 border-black bg-neutral-50 shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all hover:-translate-y-1 hover:shadow-[2px_6px_0_0_rgba(0,0,0,1)] cursor-pointer"
            onClick={onOpen}
        >
            {!hasError ? (
                <img
                    alt={image.prompt || 'Generated meme'}
                    src={image.url}
                    className={cn('w-full h-auto object-cover transition-opacity duration-500', isLoaded ? 'opacity-100' : 'opacity-0')}
                    onLoad={() => setIsLoaded(true)}
                    onError={() => setHasError(true)}
                    loading="lazy"
                />
            ) : (
                <div className="h-40 flex items-center justify-center bg-neutral-100">
                    <span className="text-xs font-bold text-black/30">(broken image)</span>
                </div>
            )}

            {!isLoaded && !hasError && (
                <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 animate-pulse">
                    <span className="text-xs font-bold text-black/20">...</span>
                </div>
            )}

            {/* Hover action overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="min-w-0 flex-1 mr-2">
                    <p className="text-white text-xs font-black truncate">@{image.username ?? 'anon'}</p>
                </div>
                <div className="flex gap-1.5 pointer-events-auto">
                    {/* Download */}
                    <button
                        onClick={handleDownload}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:bg-black hover:text-white transition-colors"
                        title="Download"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                    </button>

                    {/* Delete — only for owner */}
                    {isOwner && (
                        <button
                            onClick={handleDeleteClick}
                            disabled={deleting}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:bg-red-500 hover:border-red-500 hover:text-white transition-colors disabled:opacity-40"
                            title="Delete my meme"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14H6L5 6" />
                                <path d="M10 11v6M14 11v6" />
                                <path d="M9 6V4h6v2" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Prompt caption */}
            {image.prompt && (
                <div className="px-3 py-2 border-t-2 border-black bg-white">
                    <p className="text-xs font-bold text-black/50 truncate font-mono">&quot;{image.prompt}&quot;</p>
                </div>
            )}
        </div>
    );
}
