"use client";
import { useState, useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";
import InputBar from "./InputBar";
import { Message, ChatResponse } from "@/types/chat";
import { useLang } from "@/lib/language";

export default function ChatBox() {
    const { lang, setLang, t } = useLang();
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    const suggestions = [t("suggestion1"), t("suggestion2"), t("suggestion5"),t("suggestion3")];

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // ✅ নতুন — Browser back/forward বাটন handle করুন
    useEffect(() => {
        const handlePopState = (event: PopStateEvent) => {
            if (event.state?.hasChat) {
                // কিছু করার দরকার নেই, chat state থেকেই যাবে
            } else {
                // Back করলে chat খালি করে দিন
                setMessages([]);
            }
        };

        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, []);

    const handleSend = async (text: string): Promise<void> => {
        // ✅ প্রথম message পাঠানোর সময় history তে একটা entry push করুন
        if (messages.length === 0) {
            window.history.pushState({ hasChat: true }, "", window.location.href);
        }

        const userMsg: Message = { role: "user", text };
        setMessages((prev) => [...prev, userMsg]);
        setLoading(true);
        setMessages((prev) => [...prev, { role: "bot", text: "", isSearching: true }]);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: text }),
            });
            const data: ChatResponse = await res.json();

            setMessages((prev) => [
                ...prev.filter((m) => !m.isSearching),
                {
                    role: "bot",
                    text: data.error ? t("errorGeneral") : data.reply,
                },
            ]);
        } catch {
            setMessages((prev) => [
                ...prev.filter((m) => !m.isSearching),
                { role: "bot", text: t("errorServer") },
            ]);
        } finally {
            setLoading(false);
        }
    };

  

    return (
        <div className="flex flex-col h-dvh bg-slate-50">

            {/* Header */}
            <header className="shrink-0 bg-white border-b border-slate-100 shadow-sm">
                <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-sm shrink-0">
                            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-[16px] font-semibold text-slate-800">{t("title")}</h1>
                            <p className="text-xs text-emerald-500 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                                {t("online")}
                            </p>
                        </div>
                    </div>

                    {/* Language Switcher */}
                    <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
                        <button
                            onClick={() => setLang("bn")}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${lang === "bn"
                                ? "bg-white text-violet-600 shadow-sm"
                                : "text-slate-400 hover:text-slate-600"
                                }`}
                        >
                            <svg className="w-4 h-3.5 rounded-sm" viewBox="0 0 20 12">
                                <rect width="20" height="12" fill="#006a4e" />
                                <circle cx="9" cy="6" r="4" fill="#f42a41" />
                            </svg>

                        </button>
                        <button
                            onClick={() => setLang("en")}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${lang === "en"
                                ? "bg-white text-violet-600 shadow-sm"
                                : "text-slate-400 hover:text-slate-600"
                                }`}
                        >
                            <svg className="w-4 h-3.5 rounded-sm" viewBox="0 0 50 30">
                                <clipPath id="s">
                                    <path d="M0,0 v30 h50 v-30 z" />
                                </clipPath>
                                <path d="M0,0 L50,30 M50,0 L0,30" stroke="#fff" strokeWidth="6" clipPath="url(#s)" />
                                <path d="M0,0 L50,30 M50,0 L0,30" stroke="#012169" strokeWidth="4" clipPath="url(#s)" />
                                <path d="M25,0 v30 M0,15 h50" stroke="#fff" strokeWidth="10" />
                                <path d="M25,0 v30 M0,15 h50" stroke="#C8102E" strokeWidth="6" />
                            </svg>

                        </button>
                    </div>
                </div>
            </header>

            {/* Messages */}
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto px-3 sm:px-6 py-6">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
                            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-xl">
                                <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-slate-700 mb-2">{t("emptyTitle")}</h2>
                                <p className="text-sm text-slate-400 max-w-sm">{t("emptySubtitle")}</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full max-w-2xl">
                                {suggestions.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => handleSend(s)}
                                        className="text-sm text-left px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-600 hover:border-violet-300 hover:bg-violet-50 transition-all shadow-sm active:scale-95"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        messages.map((msg, i) => <MessageBubble key={i} message={msg} />)
                    )}
                    <div ref={bottomRef} />
                </div>
            </main>

            {/* Input */}
            <div className="shrink-0 bg-white border-t border-slate-100">
                <div className="max-w-3xl mx-auto">
                    <InputBar onSend={handleSend} loading={loading} />
                </div>
            </div>
        </div>
    );
}