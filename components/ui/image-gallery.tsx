'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useInView } from 'react-intersection-observer';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { fetchTrendingMemes, type GeneratedImage } from '@/lib/services/meme-service';

const PAGE_SIZE = 12;

// 감자(potato) 모양 스켈레톤
function PotatoSkeleton() {
    return (
        <div className="relative w-full overflow-hidden rounded-xl border-2 border-black/20 bg-neutral-100 animate-pulse">
            <svg viewBox="0 0 200 200" className="w-full h-auto opacity-20">
                <path
                    d="M100 20 Q140 10, 170 50 T180 120 Q175 170, 130 185 T60 180 Q20 160, 15 110 T30 50 Q50 15, 100 20Z"
                    fill="black"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-black text-black/20 uppercase tracking-widest">loading...</span>
            </div>
        </div>
    );
}

export function ImageGallery() {
    const [images, setImages] = useState<GeneratedImage[]>([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);

    const { ref: sentinelRef, inView } = useInView({
        threshold: 0,
        rootMargin: '400px',
    });

    const loadMore = useCallback(async () => {
        if (isLoading || !hasMore) return;

        setIsLoading(true);
        try {
            const from = page * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;
            const newImages = await fetchTrendingMemes(from, to);

            if (newImages.length < PAGE_SIZE) {
                setHasMore(false);
            }

            setImages((prev) => {
                // 중복 방지
                const existingIds = new Set(prev.map((img) => img.id));
                const uniqueNew = newImages.filter((img) => !existingIds.has(img.id));
                return [...prev, ...uniqueNew];
            });
            setPage((prev) => prev + 1);
        } catch (err) {
            console.error('Failed to load memes:', err);
        } finally {
            setIsLoading(false);
            setInitialLoad(false);
        }
    }, [page, isLoading, hasMore]);

    // 최초 로딩
    useEffect(() => {
        loadMore();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 무한 스크롤 트리거
    useEffect(() => {
        if (inView && !isLoading && hasMore && !initialLoad) {
            loadMore();
        }
    }, [inView, isLoading, hasMore, initialLoad, loadMore]);

    // 이미지를 3열 masonry 형식으로 분배
    const columns: GeneratedImage[][] = [[], [], [], []];
    images.forEach((img, i) => {
        columns[i % 4].push(img);
    });

    // 데이터가 없고 로딩도 끝났을 때
    if (!initialLoad && images.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <svg viewBox="0 0 120 120" className="w-24 h-24 mb-4 opacity-30">
                    <path
                        d="M60 10 Q90 5, 105 35 T110 75 Q105 105, 75 115 T35 110 Q10 95, 8 65 T20 30 Q35 8, 60 10Z"
                        fill="black"
                    />
                </svg>
                <p className="text-lg font-black text-black/40 uppercase tracking-widest">
                    No memes yet...
                </p>
                <p className="text-sm font-bold text-black/30 mt-2">
                    Be the first to create one! ↑
                </p>
            </div>
        );
    }

    return (
        <div className="relative flex w-full flex-col items-center justify-center pb-10">
            <div className="mx-auto grid w-full max-w-7xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {columns.map((col, colIdx) => (
                    <div key={colIdx} className="grid gap-5">
                        {col.map((image) => (
                            <MemeCard key={image.id} image={image} />
                        ))}
                    </div>
                ))}
            </div>

            {/* 스켈레톤 로딩 */}
            {isLoading && (
                <div className="mx-auto grid w-full max-w-7xl gap-5 sm:grid-cols-2 lg:grid-cols-4 mt-5">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <PotatoSkeleton key={`skel-${i}`} />
                    ))}
                </div>
            )}

            {/* 무한 스크롤 센티널 */}
            {hasMore && <div ref={sentinelRef} className="h-10 w-full" />}

            {/* 더 이상 데이터 없음 */}
            {!hasMore && images.length > 0 && (
                <p className="mt-8 text-sm font-bold text-black/30 uppercase tracking-widest">
                    — that&apos;s all folks —
                </p>
            )}
        </div>
    );
}

// 개별 밈 카드
function MemeCard({ image }: { image: GeneratedImage }) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    const handleDownload = async () => {
        try {
            const response = await fetch(image.url);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `meme-${image.id}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Download failed:', err);
        }
    };

    return (
        <div className="group relative overflow-hidden rounded-xl border-2 border-black bg-neutral-50 shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all hover:-translate-y-1 hover:shadow-[2px_6px_0_0_rgba(0,0,0,1)]">
            <AspectRatio ratio={1}>
                {!hasError ? (
                    <img
                        alt={image.prompt || 'Generated meme'}
                        src={image.url}
                        className={cn(
                            'size-full object-cover transition-opacity duration-500',
                            isLoaded ? 'opacity-100' : 'opacity-0'
                        )}
                        onLoad={() => setIsLoaded(true)}
                        onError={() => setHasError(true)}
                        loading="lazy"
                    />
                ) : (
                    <div className="size-full flex items-center justify-center bg-neutral-100">
                        <span className="text-xs font-bold text-black/30">(broken)</span>
                    </div>
                )}

                {/* 로딩 상태 */}
                {!isLoaded && !hasError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 animate-pulse">
                        <span className="text-xs font-bold text-black/20">...</span>
                    </div>
                )}

                {/* Hover 오버레이 — Download 버튼 */}
                <div className="absolute inset-0 flex items-end justify-end p-3 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <button
                        onClick={handleDownload}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_0_rgba(0,0,0,1)] transition-all"
                        title="Download"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                    </button>
                </div>
            </AspectRatio>

            {/* 프롬프트 텍스트 */}
            {image.prompt && (
                <div className="px-3 py-2 border-t-2 border-black bg-white">
                    <p className="text-xs font-bold text-black/60 truncate font-mono">
                        &quot;{image.prompt}&quot;
                    </p>
                </div>
            )}
        </div>
    );
}
