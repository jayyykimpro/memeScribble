import * as React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface MemeHeroProps {
    title: React.ReactNode;
    description: string;
    buttonText: string;
    buttonHref?: string;
}

// 스누피 느낌의 흐물거리는 선으로 이루어진 벽돌 패턴 SVG
const ScribbleBricks = () => (
    <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.15]"
        xmlns="http://www.w3.org/2000/svg"
    >
        <defs>
            <pattern
                id="scribble-bricks"
                x="0"
                y="0"
                width="160"
                height="80"
                patternUnits="userSpaceOnUse"
            >
                {/* 가로 선 (흐물흐물) */}
                <path
                    d="M -10 0 Q 30 3, 70 -2 T 170 1"
                    stroke="black"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                />
                <path
                    d="M -10 40 Q 20 38, 60 42 T 170 39"
                    stroke="black"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                />
                <path
                    d="M -10 80 Q 40 82, 80 78 T 170 81"
                    stroke="black"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                />

                {/* 세로 선 (흐물흐물) */}
                <path
                    d="M 0 0 Q 2 15, -1 30 T 1 40"
                    stroke="black"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                />
                <path
                    d="M 80 0 Q 77 15, 82 25 T 80 40"
                    stroke="black"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                />

                {/* 엇갈린 세로 선 */}
                <path
                    d="M 40 40 Q 42 55, 38 65 T 41 80"
                    stroke="black"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                />
                <path
                    d="M 120 40 Q 118 55, 123 65 T 120 80"
                    stroke="black"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                />
            </pattern>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#scribble-bricks)" />
    </svg>
);

// 하찮은 밈 캐릭터 (Wojak/Derp 스타일) SVG
const DerpyMemeScribble = () => (
    <svg
        viewBox="0 0 200 200"
        className="w-48 h-48 md:w-64 md:h-64 mx-auto mb-8 drop-shadow-xl"
        xmlns="http://www.w3.org/2000/svg"
    >
        {/* 흐물거리는 못생긴 머리 형태 */}
        <path
            d="M 90 20 Q 150 10, 170 70 Q 190 140, 140 180 Q 80 200, 30 160 Q -10 110, 20 60 Q 40 20, 90 20 Z"
            fill="white"
            stroke="black"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
        />

        {/* 쾡한 눈 1 */}
        <ellipse cx="60" cy="80" rx="15" ry="18" fill="white" stroke="black" strokeWidth="3" transform="rotate(-15 60 80)" />
        <circle cx="62" cy="82" r="3" fill="black" />

        {/* 쾡한 눈 2 (짝짝이) */}
        <ellipse cx="120" cy="75" rx="12" ry="14" fill="white" stroke="black" strokeWidth="3" transform="rotate(20 120 75)" />
        <circle cx="118" cy="77" r="2" fill="black" />

        {/* 다크서클 형태의 낙서 지렁이선 */}
        <path d="M 45 105 Q 60 110, 75 100" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" />
        <path d="M 105 95 Q 125 100, 140 85" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" />

        {/* 하찮은 코 */}
        <path d="M 85 90 Q 80 110, 95 115" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" />

        {/* 억울한 하찮은 입 (삐뚤어짐) */}
        <path
            d="M 50 140 Q 90 130, 130 150 Q 80 160, 50 140 Z"
            fill="white"
            stroke="black"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        {/* 침 흘리는 자국 */}
        <path d="M 115 145 C 120 160, 110 170, 115 185" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" />

        {/* 머리카락 몇 가닥 */}
        <path d="M 70 25 Q 65 5, 80 -5" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" />
        <path d="M 100 20 Q 110 -10, 130 5" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" />

        {/* 땀방울 또는 스트레스 마크 */}
        <circle cx="160" cy="40" r="5" fill="none" stroke="black" strokeWidth="2" />
        <path d="M 160 35 L 160 25" stroke="black" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

// 직접 그린 화살표 SVG (Lucide 대신 사용)
const ScribbleArrowRight = () => (
    <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="ml-3 h-5 w-5"
    >
        {/* 구불구불한 꼬리표 화살표 */}
        <path d="M 4 12 Q 10 9, 14 13 T 20 12" />
        <path d="M 15 7 Q 18 10, 20 12 Q 17 15, 14 18" />
    </svg>
);

export const MemeScribbleHero: React.FC<MemeHeroProps> = ({
    title,
    description,
    buttonText,
    buttonHref = "#",
}) => {
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30, rotate: -5 },
        show: {
            opacity: 1,
            y: 0,
            rotate: 0,
            transition: {
                type: "spring" as const,
                stiffness: 80,
                damping: 10,
            },
        },
    };

    return (
        <div className="relative flex w-full min-h-screen flex-col items-center justify-center bg-white overflow-hidden px-4 py-20 md:py-32 font-mono text-black">
            {/* 삐뚤빼뚤 스누피 벽돌 배경 */}
            <ScribbleBricks />

            <motion.div
                className="relative z-10 mx-auto flex max-w-2xl flex-col items-center text-center"
                initial="hidden"
                animate="show"
                variants={containerVariants}
            >
                {/* 직접 그린 하찮은 일러스트 */}
                <motion.div
                    variants={itemVariants}
                    whileHover={{ scale: 1.1, rotate: [0, -5, 5, -2, 2, 0] }}
                    transition={{ duration: 0.4 }}
                    className="cursor-pointer"
                >
                    <DerpyMemeScribble />
                </motion.div>

                {/* 삐뚤빼뚤한 제목 */}
                <motion.h1
                    variants={itemVariants}
                    className="mb-6 text-5xl font-black tracking-tighter text-black md:text-7xl uppercase"
                    style={{ textShadow: "4px 4px 0px rgba(0,0,0,0.1), -1px -1px 0px black, 1px -1px 0px black, -1px 1px 0px black, 1px 1px 0px black" }}
                >
                    {title}
                </motion.h1>

                {/* 못난이 설명글 */}
                <motion.p
                    variants={itemVariants}
                    className="mb-10 max-w-lg text-lg font-bold text-black/80 md:text-xl leading-relaxed border-2 border-black border-dashed p-4 rounded-xl bg-white/50 backdrop-blur-sm shadow-[4px_4px_0_0_rgba(0,0,0,1)] transform -rotate-1"
                >
                    {description}
                </motion.p>

                {/* 하찮고 튼튼한 장난감 버튼 */}
                <motion.div
                    variants={itemVariants}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Button asChild size="lg" className="rounded-full px-8 uppercase font-black tracking-widest text-lg">
                        <a href={buttonHref}>
                            {buttonText}
                            <ScribbleArrowRight />
                        </a>
                    </Button>
                </motion.div>
            </motion.div>
        </div>
    );
};
