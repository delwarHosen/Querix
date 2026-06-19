"use client";
// import { useState, KeyboardEvent, useRef } from "react";
import { useLang } from "@/lib/language";
import { type FC, useState, KeyboardEvent, useRef } from "react";
interface Props {
    onSend: (text: string) => void;
    loading: boolean;
}

const InputBar: FC<Props> = (props) => {
    const { t } = useLang();
    const [input, setInput] = useState<string>("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSend = (): void => {
        if (!input.trim() || props.loading) return;
        props.onSend(input.trim());
        setInput("");
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>): void => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="p-3 sm:p-4 bg-white border-t border-slate-100">
            <div className="flex items-end gap-2 bg-slate-50 rounded-2xl border border-slate-200 px-3 py-2 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100 transition-all">
                <textarea
                    ref={textareaRef}
                    className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none resize-none h-[44px] py-2 leading-relaxed overflow-y-auto"
                    placeholder={t("placeholder")}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={props.loading}
                    rows={1}
                />
                <button
                    onClick={handleSend}
                    disabled={props.loading || !input.trim()}
                    className="shrink-0 w-9 h-9 mb-0.5 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center disabled:opacity-40 hover:opacity-90 active:scale-95 transition-all shadow-sm"
                    aria-label={t("send")}
                >
                    {props.loading ? (
                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                    ) : (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M22 2L11 13" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M22 2L15 22L11 13L2 9L22 2Z" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    )}
                </button>
            </div>
            <p className="text-center text-xs text-slate-300 mt-2">{t("enterHint")}</p>
        </div>
    );
}


export default InputBar;