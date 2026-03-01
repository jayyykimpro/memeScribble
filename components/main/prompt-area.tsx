"use client"

import {
    PromptInput,
    PromptInputAction,
    PromptInputActions,
    PromptInputTextarea,
} from "@/components/ui/prompt-input"
import { useRef, useState } from "react"
import { uploadMeme } from "@/lib/services/meme-service"

// SVG 아이콘들 (Lucide 대신 직접 구현)
const IconPaperclip = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
)

const IconX = () => (
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

export function PromptArea() {
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [files, setFiles] = useState<File[]>([])
    const [error, setError] = useState<string | null>(null)
    const [successUrl, setSuccessUrl] = useState<string | null>(null)
    const uploadInputRef = useRef<HTMLInputElement>(null)

    const handleSubmit = async () => {
        if (!input.trim() && files.length === 0) return

        setIsLoading(true)
        setError(null)
        setSuccessUrl(null)

        try {
            // 파일이 있으면 첫 번째 파일을 업로드, 없으면 빈 Blob
            const file = files.length > 0
                ? files[0]
                : new Blob(["placeholder"], { type: "image/png" })

            const result = await uploadMeme(file, input.trim())
            setSuccessUrl(result.url)
            setInput("")
            setFiles([])
        } catch (err) {
            const message = err instanceof Error ? err.message : "업로드에 실패했습니다."
            setError(message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const newFiles = Array.from(event.target.files)
            setFiles((prev) => [...prev, ...newFiles])
        }
    }

    const handleRemoveFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index))
        if (uploadInputRef?.current) {
            uploadInputRef.current.value = ""
        }
    }

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* 프롬프트 위 힌트 */}
            <p className="text-center text-sm font-bold text-black/50 mb-4 tracking-wide uppercase">
                Make it NOW!
            </p>

            <PromptInput
                value={input}
                onValueChange={setInput}
                isLoading={isLoading}
                onSubmit={handleSubmit}
                className="w-full border-2 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] rounded-2xl bg-white"
            >
                {/* 첨부된 파일 목록 */}
                {files.length > 0 && (
                    <div className="flex flex-wrap gap-2 pb-2">
                        {files.map((file, index) => (
                            <div
                                key={index}
                                className="bg-secondary flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-mono border border-black/20"
                            >
                                <IconPaperclip />
                                <span className="max-w-[120px] truncate">{file.name}</span>
                                <button
                                    onClick={() => handleRemoveFile(index)}
                                    className="hover:bg-black/10 rounded-full p-1 transition-colors"
                                >
                                    <IconX />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* 텍스트 입력 영역 */}
                <PromptInputTextarea
                    placeholder="Describe how you want... or just attach a photo."
                    className="font-mono text-base placeholder:text-black/30"
                />

                {/* 상태 메시지 */}
                {error && (
                    <p className="text-red-500 text-xs font-bold px-1 pt-1">{error}</p>
                )}
                {successUrl && (
                    <p className="text-green-600 text-xs font-bold px-1 pt-1">✅ 업로드 완료!</p>
                )}

                {/* 하단 액션 버튼 */}
                <PromptInputActions className="flex items-center justify-between gap-2 pt-2">
                    {/* 파일 첨부 */}
                    <PromptInputAction tooltip="Attach image">
                        <label
                            htmlFor="file-upload"
                            className="hover:bg-secondary flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-black/60 hover:text-black transition-colors"
                        >
                            <input
                                ref={uploadInputRef}
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                                id="file-upload"
                            />
                            <IconPaperclip />
                        </label>
                    </PromptInputAction>

                    {/* 전송 버튼 */}
                    <PromptInputAction tooltip={isLoading ? "Stop" : "Send"}>
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
