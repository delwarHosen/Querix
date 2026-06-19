"use client";
import { createContext, useContext, useState, ReactNode, JSX } from "react";

type Lang = "bn" | "en";

interface LangContextType {
    lang: Lang;
    setLang: (l: Lang) => void;
    t: (key: string) => string;
}

const translations: Record<string, Record<Lang, string>> = {
    title: { bn: "Querix", en: "Querix" },
    online: { bn: "অনলাইন", en: "online" },
    placeholder: { bn: "কিছু জিজ্ঞেস করুন...", en: "Ask me anything..." },
    send: { bn: "পাঠান", en: "Send" },
    enterHint: {
        bn: "Enter পাঠান · Shift+Enter নতুন লাইন",
        en: "Enter to send · Shift+Enter for new line",
    },
    emptyTitle: { bn: "কীভাবে সাহায্য করতে পারি?", en: "How can I help you?" },
    emptySubtitle: {
        bn: "যেকোনো প্রশ্ন করুন — সাধারণ জ্ঞান থেকে সর্বশেষ খবর পর্যন্ত",
        en: "Ask anything — from general knowledge to the latest news",
    },
    searching: { bn: "ওয়েব খুঁজছি...", en: "Searching the web..." },
    errorGeneral: {
        bn: "❌ কিছু একটা সমস্যা হয়েছে! আবার চেষ্টা করুন।",
        en: "❌ Something went wrong! Please try again.",
    },
    errorServer: {
        bn: "❌ সার্ভারের সাথে সংযোগ করা যাচ্ছে না!",
        en: "❌ Could not connect to the server!",
    },
    you: { bn: "আপনি", en: "You" },
    suggestion1: { bn: "আজকের আবহাওয়া কেমন?", en: "What's the weather today?" },
    suggestion2: { bn: "বিশ্বকাপে আজকে কার ম্যাচ?", en: "World Cup matches today?" },
    suggestion3: { bn: "Next.js কী?", en: "What is Next.js?" },
    suggestion4: { bn: "ফিফা বিশ্বকাপ ২০২৬: আজকের ম্যাচসমূহ", en: "FIFA World Cup 2026: Today's Matches" },
    suggestion5: { bn: "ফিফা বিশ্বকাপ ২০২৬-এর সর্বোচ্চ গোলদাতা", en: "FIFA World Cup 2026 Top Scorer" },
};

const LangContext = createContext<LangContextType | null>(null);

export function LangProvider(props: { children: ReactNode }): JSX.Element {
    const [lang, setLang] = useState<Lang>("bn");

    const t = (key: string): string => translations[key]?.[lang] ?? key;

    return (
        <LangContext.Provider value={{ lang, setLang, t }}>
            {props.children}
        </LangContext.Provider>
    );
}

export function useLang(): LangContextType {
    const ctx = useContext(LangContext);
    if (!ctx) throw new Error("useLang must be used within LangProvider");
    return ctx;
}