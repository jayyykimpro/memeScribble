"use client"

import {
    PromptInput,
    PromptInputAction,
    PromptInputActions,
    PromptInputTextarea,
} from "@/components/ui/prompt-input"
import { useRef, useState } from "react"
import { generateMemeImage } from "@/lib/services/gemini-service"
import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

const IconPaperclip = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
)

const IconXSmall = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M18 6L6 18M6 6l12 12" />
    </svg>
)

const IconArrowUp = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
)

const IconStop = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <rect x="4" y="4" width="16" height="16" rx="2" />
    </svg>
)

export type GenerationStatus = "idle" | "generating" | "uploading" | "done" | "error"

interface PromptAreaProps {
    onStatusChange?: (status: GenerationStatus, errorMsg?: string, imageDataUrl?: string) => void
    isActive?: boolean
}

export function PromptArea({ onStatusChange, isActive }: PromptAreaProps) {
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [files, setFiles] = useState<File[]>([])
    const uploadInputRef = useRef<HTMLInputElement>(null)

    const notify = (status: GenerationStatus, errorMsg?: string, imageDataUrl?: string) => {
        onStatusChange?.(status, errorMsg, imageDataUrl)
    }

    const handleSubmit = async () => {
        if (!input.trim() && files.length === 0) return

        setIsLoading(true)
        notify("generating")

        try {
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token
            const referenceImage = files.length > 0 ? files[0] : undefined

            // Single call: Gemini + R2 + DB all on server
            const { dataUrl } = await generateMemeImage(
                input.trim() || "Make a funny wojak meme",
                referenceImage,
                token
            )

            notify("done", undefined, dataUrl)
            setInput("")
            setFiles([])
            setTimeout(() => notify("idle"), 8000)  // keep image visible longer

        } catch (err) {
            const message = err instanceof Error ? err.message : "Generation failed."
            notify("error", message)
            setTimeout(() => notify("idle"), 4000)
        } finally {
            setIsLoading(false)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) setFiles(prev => [...prev, ...Array.from(e.target.files!)])
    }

    const handleRemoveFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index))
        if (uploadInputRef.current) uploadInputRef.current.value = ""
    }

    return (
        <div className="w-full max-w-2xl mx-auto">
            {!isActive && (
                <p className="text-center text-sm font-bold text-black/50 mb-4 tracking-wide uppercase">
                    What&apos;s your meme?
                </p>
            )}

            <PromptInput
                value={input}
                onValueChange={setInput}
                isLoading={isLoading}
                onSubmit={handleSubmit}
                className="w-full border-2 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] rounded-2xl bg-white"
            >
                {files.length > 0 && (
                    <div className="flex flex-wrap gap-2 pb-2">
                        {files.map((file, index) => (
                            <div key={index} className="bg-secondary flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-mono border border-black/20">
                                <IconPaperclip />
                                <span className="max-w-[120px] truncate">{file.name}</span>
                                <button onClick={() => handleRemoveFile(index)} className="hover:bg-black/10 rounded-full p-1 transition-colors">
                                    <IconXSmall />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <PromptInputTextarea
                    placeholder="what do you want?"
                    className="font-mono text-base placeholder:text-black/30"
                />

                <PromptInputActions className="flex items-center justify-between gap-2 pt-2">
                    <PromptInputAction tooltip="Attach image to wojakify">
                        <label htmlFor="file-upload" className="hover:bg-secondary flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-black/60 hover:text-black transition-colors">
                            <input
                                ref={uploadInputRef}
                                type="file"
                                multiple={false}
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                                id="file-upload"
                            />
                            <IconPaperclip />
                        </label>
                    </PromptInputAction>

                    <PromptInputAction tooltip={isLoading ? "Generating..." : "Generate meme!"}>
                        <button
                            onClick={handleSubmit}
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-white shadow-[3px_3px_0_0_rgba(0,0,0,0.3)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_rgba(0,0,0,0.3)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:opacity-40"
                            disabled={isLoading || (!input.trim() && files.length === 0)}
                        >
                            {isLoading ? <IconStop /> : <IconArrowUp />}
                        </button>
                    </PromptInputAction>
                </PromptInputActions>
            </PromptInput>
        </div>
    )
}
