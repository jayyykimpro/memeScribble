"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/auth-context";

const navLinks = [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Contact", href: "#contact" },
];

export function Navbar() {
    const [menuOpen, setMenuOpen] = React.useState(false);
    const { user, loading, signOut } = useAuth();
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut();
        router.push("/");
    };

    const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
    const name = (user?.user_metadata?.full_name ?? user?.email ?? "") as string;

    return (
        <header className="fixed top-0 left-0 right-0 z-50 border-b-2 border-black bg-white font-mono">
            <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
                {/* 왼쪽: 타이틀 */}
                <Link
                    href="/"
                    className="text-xl font-black uppercase tracking-widest text-black hover:underline decoration-wavy transition-all"
                >
                    Meme me
                </Link>

                {/* 중앙: 데스크탑 네비 링크 */}
                <ul className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <li key={link.label}>
                            <Link
                                href={link.href}
                                className="relative text-sm font-bold uppercase tracking-widest text-black after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-black after:transition-all hover:after:w-full"
                            >
                                {link.label}
                            </Link>
                        </li>
                    ))}
                </ul>

                {/* 오른쪽: 로그인 상태에 따라 다른 UI */}
                <div className="hidden md:flex items-center gap-3">
                    {loading ? (
                        <div className="h-9 w-24 animate-pulse rounded-full bg-black/10" />
                    ) : user ? (
                        <>
                            {/* 유저 아바타 + 이름 */}
                            <div className="flex items-center gap-2">
                                {avatarUrl ? (
                                    <img
                                        src={avatarUrl}
                                        alt={name}
                                        className="h-8 w-8 rounded-full border-2 border-black object-cover"
                                    />
                                ) : (
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-black bg-black text-xs font-black text-white">
                                        {name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <span className="max-w-[120px] truncate text-sm font-bold text-black">
                                    {name}
                                </span>
                            </div>
                            {/* 로그아웃 버튼 */}
                            <button
                                onClick={handleSignOut}
                                className="rounded-full border-2 border-black bg-white px-4 py-1.5 text-sm font-black uppercase tracking-widest text-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
                            >
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <Link
                            href="/auth"
                            className="rounded-full border-2 border-black bg-black px-5 py-2 text-sm font-black uppercase tracking-widest text-white shadow-[4px_4px_0_0_rgba(0,0,0,0.3)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_rgba(0,0,0,0.3)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
                        >
                            Get Started
                        </Link>
                    )}
                </div>

                {/* 모바일 햄버거 버튼 */}
                <button
                    className="flex md:hidden flex-col gap-1.5 p-2"
                    onClick={() => setMenuOpen((v) => !v)}
                    aria-label="메뉴 열기/닫기"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round">
                        {menuOpen ? (
                            <>
                                <path d="M5 5 L19 19" />
                                <path d="M19 5 L5 19" />
                            </>
                        ) : (
                            <>
                                <path d="M3 7 Q12 5, 21 7" />
                                <path d="M3 12 Q12 14, 21 12" />
                                <path d="M3 17 Q12 15, 21 17" />
                            </>
                        )}
                    </svg>
                </button>
            </nav>

            {/* 모바일 드롭다운 메뉴 */}
            {menuOpen && (
                <div className="border-t-2 border-black bg-white px-4 pb-4 md:hidden">
                    <ul className="flex flex-col gap-4 pt-4">
                        {navLinks.map((link) => (
                            <li key={link.label}>
                                <Link
                                    href={link.href}
                                    onClick={() => setMenuOpen(false)}
                                    className="block text-sm font-bold uppercase tracking-widest text-black hover:underline decoration-wavy"
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                        <li>
                            {user ? (
                                <button
                                    onClick={() => { setMenuOpen(false); handleSignOut(); }}
                                    className="inline-block rounded-full border-2 border-black bg-white px-5 py-2 text-sm font-black uppercase tracking-widest text-black"
                                >
                                    Sign Out
                                </button>
                            ) : (
                                <Link
                                    href="/auth"
                                    onClick={() => setMenuOpen(false)}
                                    className="inline-block rounded-full border-2 border-black bg-black px-5 py-2 text-sm font-black uppercase tracking-widest text-white"
                                >
                                    Get Started
                                </Link>
                            )}
                        </li>
                    </ul>
                </div>
            )}
        </header>
    );
}
