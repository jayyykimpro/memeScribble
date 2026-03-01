"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Rainbow color theme configuration
 * Defines the color spectrum and visual characteristics
 */
export interface RainbowTheme {
    /** Unique identifier for the theme */
    name: string;
    /** Array of colors in the rainbow spectrum (minimum 3 colors) */
    colors: string[];
    /** Base opacity of the rainbow effect (0-1) */
    baseOpacity: number;
    /** Amount of blur applied to the gradient (in px) */
    blurAmount: number;
    /** Intensity of the glow effect (0-1) */
    glowIntensity: number;
    /** Background darkness for contrast (0-1) */
    vignetteStrength: number;
}

/**
 * Particle system configuration
 * Controls the floating particle effects
 */
export interface ParticleConfig {
    /** Number of particles to render */
    count: number;
    /** Minimum particle size (in px) */
    minSize: number;
    /** Maximum particle size (in px) */
    maxSize: number;
    /** Intensity of particle glow (0-1) */
    glowIntensity: number;
    /** Enable/disable particles */
    enabled: boolean;
}

/**
 * Animation timing and behavior configuration
 */
export interface RainbowAnimationConfig {
    /** Duration of the main gradient animation (in seconds) */
    gradientSpeed: number;
    /** Duration of the secondary layer animation (in seconds) */
    secondarySpeed: number;
    /** Duration of the radial gradient pulse (in seconds) */
    pulseSpeed: number;
    /** Duration of text reveal animation (in seconds) */
    textRevealSpeed: number;
    /** Delay between each letter animation (in seconds) */
    letterDelay: number;
    /** Type of easing for animations */
    ease: "linear" | "easeIn" | "easeOut" | "easeInOut";
}

/**
 * Main component props for RainbowHero
 */
export interface RainbowHeroProps {
    /** Main heading text */
    title?: string;
    /** Subheading or description text */
    description?: string;
    /** Primary call-to-action button */
    primaryAction?: {
        label: string;
        onClick: () => void;
    };
    /** Secondary call-to-action button */
    secondaryAction?: {
        label: string;
        onClick: () => void;
    };
    /** Additional CSS classes */
    className?: string;
    /** Custom content (overrides default layout) */
    children?: React.ReactNode;
    /** Theme preset or custom theme configuration */
    theme?: RainbowTheme | keyof typeof RAINBOW_THEMES;
    /** Particle system configuration */
    particleConfig?: Partial<ParticleConfig>;
    /** Animation configuration */
    animationConfig?: Partial<RainbowAnimationConfig>;
    /** Disable all animations for accessibility */
    disableAnimations?: boolean;
    /** Custom ARIA label for the hero section */
    ariaLabel?: string;
}

/**
 * Pre-configured rainbow theme presets
 * Each theme provides a unique visual style
 */
export const RAINBOW_THEMES = {
    /** Classic 7-color rainbow spectrum (ROYGBIV) */
    classic: {
        name: "Classic Rainbow",
        colors: ["#ff0000", "#ff7f00", "#ffff00", "#00ff00", "#0000ff", "#4b0082", "#9400d3"],
        baseOpacity: 0.5,
        blurAmount: 80,
        glowIntensity: 0.8,
        vignetteStrength: 0.85,
    },
    /** Soft pastel rainbow colors */
    pastel: {
        name: "Pastel Dream",
        colors: ["#ffb3ba", "#ffdfba", "#ffffba", "#baffc9", "#bae1ff", "#d4baff", "#ffb3f0"],
        baseOpacity: 0.6,
        blurAmount: 100,
        glowIntensity: 0.6,
        vignetteStrength: 0.75,
    },
    /** High-intensity neon rainbow */
    neon: {
        name: "Neon Nights",
        colors: ["#ff006e", "#ff4d00", "#ffff00", "#00ff41", "#00d9ff", "#6e00ff", "#ff00ff"],
        baseOpacity: 0.7,
        blurAmount: 60,
        glowIntensity: 1.0,
        vignetteStrength: 0.9,
    },
    /** Dark rainbow with muted tones */
    dark: {
        name: "Dark Spectrum",
        colors: ["#8b0000", "#ff4500", "#b8860b", "#006400", "#00008b", "#4b0082", "#800080"],
        baseOpacity: 0.4,
        blurAmount: 90,
        glowIntensity: 0.5,
        vignetteStrength: 0.95,
    },
    /** Tropical vibrant colors */
    tropical: {
        name: "Tropical Paradise",
        colors: ["#ff1744", "#ff9100", "#ffd600", "#00e676", "#00e5ff", "#d500f9", "#ff4081"],
        baseOpacity: 0.65,
        blurAmount: 70,
        glowIntensity: 0.85,
        vignetteStrength: 0.8,
    },
    /** Cool tones rainbow */
    cool: {
        name: "Cool Breeze",
        colors: ["#00bcd4", "#03a9f4", "#2196f3", "#3f51b5", "#673ab7", "#9c27b0", "#e91e63"],
        baseOpacity: 0.55,
        blurAmount: 85,
        glowIntensity: 0.7,
        vignetteStrength: 0.82,
    },
    /** Warm tones rainbow */
    warm: {
        name: "Warm Sunset",
        colors: ["#ff5252", "#ff6e40", "#ffab40", "#ffd740", "#ffff00", "#ff6f00", "#ff3d00"],
        baseOpacity: 0.6,
        blurAmount: 75,
        glowIntensity: 0.75,
        vignetteStrength: 0.85,
    },
    /** Retro 80s inspired rainbow */
    retro: {
        name: "Retro Wave",
        colors: ["#ff006e", "#fb5607", "#ffbe0b", "#8338ec", "#3a86ff", "#ff006e", "#fb5607"],
        baseOpacity: 0.65,
        blurAmount: 65,
        glowIntensity: 0.9,
        vignetteStrength: 0.88,
    },
} as const satisfies Record<string, RainbowTheme>;

/**
 * Default particle configuration
 */
const DEFAULT_PARTICLE_CONFIG: ParticleConfig = {
    count: 30,
    minSize: 4,
    maxSize: 12,
    glowIntensity: 0.8,
    enabled: true,
};

/**
 * Default animation configuration
 */
const DEFAULT_ANIMATION_CONFIG: RainbowAnimationConfig = {
    gradientSpeed: 25,
    secondarySpeed: 20,
    pulseSpeed: 10,
    textRevealSpeed: 1.2,
    letterDelay: 0.03,
    ease: "linear" as const,
};

/**
 * RainbowHero Component
 * 
 * A vibrant hero section with animated rainbow gradients and particle effects.
 * Features multiple theme presets, full animation control, and accessibility support.
 * 
 * @example
 * ```tsx
 * // Basic usage with default theme
 * <RainbowHero
 *   title="Welcome to Rainbow"
 *   description="Experience the spectrum"
 * />
 * 
 * // With preset theme
 * <RainbowHero
 *   theme="neon"
 *   title="Neon Dreams"
 * />
 * 
 * // With custom configuration
 * <RainbowHero
 *   theme={RAINBOW_THEMES.pastel}
 *   particleConfig={{ count: 50, minSize: 6 }}
 *   animationConfig={{ gradientSpeed: 15 }}
 * />
 * ```
 */

export function RainbowHero({
    title,
    description,
    primaryAction,
    secondaryAction,
    className,
    children,
    theme = "classic",
    particleConfig,
    animationConfig,
    disableAnimations = false,
    ariaLabel = "Rainbow hero section",
}: RainbowHeroProps) {
    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    // Resolve theme (handle both string keys and theme objects)
    const resolvedTheme: RainbowTheme =
        typeof theme === "string" ? RAINBOW_THEMES[theme] : theme;

    // Merge configurations with defaults
    const particles: ParticleConfig = { ...DEFAULT_PARTICLE_CONFIG, ...particleConfig };
    const animations: RainbowAnimationConfig = { ...DEFAULT_ANIMATION_CONFIG, ...animationConfig };

    const titleWords = title?.split(" ") || [];

    // Generate gradient string from theme colors
    const generateGradient = (colors: string[], angle: number = 100) => {
        const step = 100 / (colors.length - 1);
        return colors.map((color, i) => `${color} ${i * step}%`).join(", ");
    };

    // Generate extended gradient for seamless looping
    const generateExtendedGradient = (colors: string[]) => {
        const extended = [...colors, ...colors.slice(0, 3)];
        const step = 100 / (extended.length - 1);
        return extended.map((color, i) => `${color} ${i * step}%`).join(", ");
    };

    return (
        <section
            className={cn(
                "relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-background",
                className
            )}
            role="banner"
            aria-label={ariaLabel}
        >
            {/* Rainbow Gradient Background - Full Spectrum */}
            <div
                className="absolute inset-0 overflow-hidden"
                aria-hidden="true"
                style={{ opacity: resolvedTheme.baseOpacity }}
            >
                {/* Primary gradient layer */}
                {!disableAnimations ? (
                    <motion.div
                        className="absolute inset-[-100%]"
                        style={{
                            background: `repeating-linear-gradient(100deg, ${generateExtendedGradient(resolvedTheme.colors)})`,
                            backgroundSize: "400% 100%",
                            filter: `blur(${resolvedTheme.blurAmount}px)`,
                        }}
                        animate={{
                            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                        }}
                        transition={{
                            duration: animations.gradientSpeed,
                            repeat: Infinity,
                            ease: animations.ease,
                        }}
                    />
                ) : (
                    <div
                        className="absolute inset-[-100%]"
                        style={{
                            background: `repeating-linear-gradient(100deg, ${generateExtendedGradient(resolvedTheme.colors)})`,
                            backgroundSize: "400% 100%",
                            filter: `blur(${resolvedTheme.blurAmount}px)`,
                        }}
                    />
                )}

                {/* Secondary gradient layer with blend mode */}
                {!disableAnimations ? (
                    <motion.div
                        className="absolute inset-[-10px]"
                        style={{
                            background: `
                repeating-linear-gradient(100deg, 
                  ${resolvedTheme.colors.map((color, i) =>
                                `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, 0.15) ${i * 5}%, 
                     rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, 0.15) ${i * 5 + 5}%, 
                     transparent ${i * 5 + 8}%, 
                     transparent ${i * 5 + 10}%`
                            ).join(", ")}),
                repeating-linear-gradient(100deg, ${generateExtendedGradient(resolvedTheme.colors)})
              `,
                            backgroundSize: "300%, 100%",
                            backgroundPosition: "50% 50%, 50% 50%",
                            mixBlendMode: "difference",
                        }}
                        animate={{
                            backgroundPosition: [
                                "50% 50%, 50% 50%",
                                "100% 50%, 150% 50%",
                                "50% 50%, 50% 50%",
                            ],
                        }}
                        transition={{
                            duration: animations.secondarySpeed,
                            repeat: Infinity,
                            ease: animations.ease,
                        }}
                    />
                ) : (
                    <div
                        className="absolute inset-[-10px]"
                        style={{
                            background: `repeating-linear-gradient(100deg, ${generateExtendedGradient(resolvedTheme.colors)})`,
                            backgroundSize: "300%, 100%",
                            mixBlendMode: "difference",
                        }}
                    />
                )}

                {/* Radial gradient layer for depth */}
                {!disableAnimations ? (
                    <motion.div
                        className="absolute inset-0"
                        style={{
                            background: resolvedTheme.colors
                                .map((color, i) => {
                                    const positions = [
                                        "20% 30%", "80% 30%", "50% 50%",
                                        "20% 70%", "80% 70%", "50% 90%", "50% 10%"
                                    ];
                                    return `radial-gradient(ellipse at ${positions[i % positions.length]}, ${color.replace('#', 'rgba(').replace(/(..)(..)(..)/, '$1,$2,$3').replace(')', `,${resolvedTheme.glowIntensity * 0.3})`)} 0%, transparent 40%)`;
                                })
                                .join(", "),
                            filter: "blur(60px)",
                        }}
                        animate={{
                            opacity: [0.3, 0.6, 0.3],
                            scale: [1, 1.1, 1],
                        }}
                        transition={{
                            duration: animations.pulseSpeed,
                            repeat: Infinity,
                            ease: "easeInOut" as const,
                        }}
                    />
                ) : (
                    <div
                        className="absolute inset-0"
                        style={{
                            background: resolvedTheme.colors
                                .map((color, i) => {
                                    const positions = [
                                        "20% 30%", "80% 30%", "50% 50%",
                                        "20% 70%", "80% 70%", "50% 90%", "50% 10%"
                                    ];
                                    return `radial-gradient(ellipse at ${positions[i % positions.length]}, ${color.replace('#', 'rgba(').replace(/(..)(..)(..)/, '$1,$2,$3').replace(')', `,${resolvedTheme.glowIntensity * 0.3})`)} 0%, transparent 40%)`;
                                })
                                .join(", "),
                            filter: "blur(60px)",
                            opacity: 0.5,
                        }}
                    />
                )}
            </div>

            {/* Vignette Overlay */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: `radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, ${resolvedTheme.vignetteStrength}) 100%)`,
                }}
                aria-hidden="true"
            />

            {/* Colorful Floating Particles */}
            {isMounted && particles.enabled && Array.from({ length: particles.count }).map((_, i) => {
                const particleColor = resolvedTheme.colors[i % resolvedTheme.colors.length];
                const particleSize = Math.random() * (particles.maxSize - particles.minSize) + particles.minSize;

                return !disableAnimations ? (
                    <motion.div
                        key={i}
                        className="absolute rounded-full pointer-events-none"
                        style={{
                            width: `${particleSize}px`,
                            height: `${particleSize}px`,
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            background: particleColor,
                            boxShadow: `0 0 ${20 * particles.glowIntensity}px ${particleColor}`,
                        }}
                        animate={{
                            y: [0, -30, 0],
                            x: [0, Math.random() * 20 - 10, 0],
                            opacity: [0, particles.glowIntensity, 0],
                            scale: [0, 1, 0],
                        }}
                        transition={{
                            duration: 3 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 3,
                            ease: "easeInOut" as const,
                        }}
                    />
                ) : (
                    <div
                        key={i}
                        className="absolute rounded-full pointer-events-none"
                        style={{
                            width: `${particleSize}px`,
                            height: `${particleSize}px`,
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            background: particleColor,
                            boxShadow: `0 0 ${20 * particles.glowIntensity}px ${particleColor}`,
                            opacity: 0.3,
                        }}
                    />
                );
            })}

            {/* Content Layer */}
            {children ? (
                <div className="relative z-10 w-full">{children}</div>
            ) : (
                <div className="relative z-10 container mx-auto px-4 md:px-6 text-center">
                    {!disableAnimations ? (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: animations.textRevealSpeed, ease: "easeOut" as const }}
                            className="max-w-5xl mx-auto"
                        >
                            {/* Animated Title with Rainbow Colors */}
                            {title && (
                                <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-bold mb-8 tracking-tight">
                                    {titleWords.map((word, wordIndex) => (
                                        <span key={wordIndex} className="inline-block mr-4 last:mr-0 mb-2">
                                            {word.split("").map((letter, letterIndex) => {
                                                const colorIndex = (wordIndex * 10 + letterIndex) % resolvedTheme.colors.length;
                                                const letterColor = resolvedTheme.colors[colorIndex];

                                                return (
                                                    <motion.span
                                                        key={`${wordIndex}-${letterIndex}`}
                                                        initial={{
                                                            y: 100,
                                                            opacity: 0,
                                                            filter: "blur(8px)",
                                                        }}
                                                        animate={{
                                                            y: 0,
                                                            opacity: 1,
                                                            filter: "blur(0px)",
                                                        }}
                                                        transition={{
                                                            delay: wordIndex * 0.1 + letterIndex * animations.letterDelay,
                                                            type: "spring",
                                                            stiffness: 100,
                                                            damping: 15,
                                                        }}
                                                        whileHover={{
                                                            scale: 1.2,
                                                            rotate: [0, -10, 10, 0],
                                                            transition: { duration: 0.3 },
                                                        }}
                                                        className="inline-block cursor-default"
                                                        style={{
                                                            color: letterColor,
                                                            textShadow: `0 0 ${30 * resolvedTheme.glowIntensity}px ${letterColor}, 0 0 ${60 * resolvedTheme.glowIntensity}px ${letterColor}`,
                                                            fontWeight: 900,
                                                        }}
                                                    >
                                                        {letter}
                                                    </motion.span>
                                                );
                                            })}
                                        </span>
                                    ))}
                                </h1>
                            )}

                            {/* Description */}
                            {description && (
                                <motion.p
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 1, delay: 0.6 }}
                                    className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed"
                                    style={{
                                        textShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
                                    }}
                                >
                                    {description}
                                </motion.p>
                            )}

                            {/* Action Buttons with Rainbow Gradient */}
                            {(primaryAction || secondaryAction) && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.8, delay: 1 }}
                                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                                >
                                    {primaryAction && (
                                        <motion.button
                                            onClick={primaryAction.onClick}
                                            className="px-8 py-4 text-base sm:text-lg font-bold rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-background relative overflow-hidden"
                                            style={{
                                                background: `linear-gradient(90deg, ${generateExtendedGradient(resolvedTheme.colors)})`,
                                                backgroundSize: "200% 100%",
                                                color: "#ffffff",
                                                textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
                                            }}
                                            whileHover={{
                                                scale: 1.05,
                                                backgroundPosition: "100% 50%",
                                            }}
                                            animate={{
                                                backgroundPosition: ["0% 50%", "100% 50%"],
                                            }}
                                            transition={{
                                                backgroundPosition: {
                                                    duration: 3,
                                                    repeat: Infinity,
                                                    ease: "linear" as const,
                                                },
                                            }}
                                            aria-label={primaryAction.label}
                                        >
                                            {primaryAction.label}
                                        </motion.button>
                                    )}

                                    {secondaryAction && (
                                        <motion.button
                                            onClick={secondaryAction.onClick}
                                            className="px-8 py-4 text-base sm:text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-background"
                                            style={{
                                                background: "rgba(255, 255, 255, 0.1)",
                                                color: "#ffffff",
                                                border: "2px solid rgba(255, 255, 255, 0.3)",
                                                backdropFilter: "blur(10px)",
                                                textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
                                            }}
                                            whileHover={{
                                                scale: 1.05,
                                                background: "rgba(255, 255, 255, 0.2)",
                                                borderColor: "rgba(255, 255, 255, 0.5)",
                                            }}
                                            aria-label={secondaryAction.label}
                                        >
                                            {secondaryAction.label}
                                        </motion.button>
                                    )}
                                </motion.div>
                            )}
                        </motion.div>
                    ) : (
                        <div className="max-w-5xl mx-auto">
                            {/* Static Title with Rainbow Colors */}
                            {title && (
                                <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-bold mb-8 tracking-tight">
                                    {titleWords.map((word, wordIndex) => (
                                        <span key={wordIndex} className="inline-block mr-4 last:mr-0 mb-2">
                                            {word.split("").map((letter, letterIndex) => {
                                                const colorIndex = (wordIndex * 10 + letterIndex) % resolvedTheme.colors.length;
                                                const letterColor = resolvedTheme.colors[colorIndex];

                                                return (
                                                    <span
                                                        key={`${wordIndex}-${letterIndex}`}
                                                        className="inline-block"
                                                        style={{
                                                            color: letterColor,
                                                            textShadow: `0 0 ${30 * resolvedTheme.glowIntensity}px ${letterColor}, 0 0 ${60 * resolvedTheme.glowIntensity}px ${letterColor}`,
                                                            fontWeight: 900,
                                                        }}
                                                    >
                                                        {letter}
                                                    </span>
                                                );
                                            })}
                                        </span>
                                    ))}
                                </h1>
                            )}

                            {/* Static Description */}
                            {description && (
                                <p
                                    className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed"
                                    style={{
                                        textShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
                                    }}
                                >
                                    {description}
                                </p>
                            )}

                            {/* Static Action Buttons */}
                            {(primaryAction || secondaryAction) && (
                                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                    {primaryAction && (
                                        <button
                                            onClick={primaryAction.onClick}
                                            className="px-8 py-4 text-base sm:text-lg font-bold rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-background"
                                            style={{
                                                background: `linear-gradient(90deg, ${generateExtendedGradient(resolvedTheme.colors)})`,
                                                color: "#ffffff",
                                                textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
                                            }}
                                            aria-label={primaryAction.label}
                                        >
                                            {primaryAction.label}
                                        </button>
                                    )}

                                    {secondaryAction && (
                                        <button
                                            onClick={secondaryAction.onClick}
                                            className="px-8 py-4 text-base sm:text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-background"
                                            style={{
                                                background: "rgba(255, 255, 255, 0.1)",
                                                color: "#ffffff",
                                                border: "2px solid rgba(255, 255, 255, 0.3)",
                                                backdropFilter: "blur(10px)",
                                                textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
                                            }}
                                            aria-label={secondaryAction.label}
                                        >
                                            {secondaryAction.label}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}
