import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 tracking-wider",
    {
        variants: {
            variant: {
                default: "bg-white text-black border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
                destructive:
                    "bg-white text-black border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:bg-black hover:text-white",
                outline:
                    "border-2 border-black bg-transparent text-black hover:bg-black hover:text-white border-dashed",
                secondary:
                    "bg-gray-200 text-black border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]",
                ghost: "hover:bg-gray-100 hover:text-black",
                link: "text-black underline-offset-4 hover:underline decoration-wavy",
            },
            size: {
                default: "h-12 px-6 py-2 text-base",
                sm: "h-9 rounded-md px-3",
                lg: "h-14 rounded-md px-8 text-lg",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    },
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    },
)
Button.displayName = "Button"

export { Button, buttonVariants }
