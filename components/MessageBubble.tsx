"use client";
import { type FC } from "react";
import { Message } from "@/types/chat";
import { useLang } from "@/lib/language";

interface Props {
    message: Message;
}

const MessageBubble: FC<{ message: Message }> = (props) => {
    const { t } = useLang();
    const { message } = props;
    const isUser = message.role === "user";

    if (message.isSearching) {
        return (
            <div className="flex justify-start mb-4">
                <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white border border-slate-100 shadow-sm text-slate-400 text-sm">
                    <span className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:0ms]" />
                        <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:150ms]" />
                        <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:300ms]" />
                    </span>
                    {t("searching")}
                </div>
            </div>
        );
    }

    return (
        <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
            {!isUser && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-semibold mr-2 mt-1 shrink-0 shadow-sm">
                    AI
                </div>
            )}

            <div
                className={`relative max-w-[78%] sm:max-w-[65%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${isUser
                    ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-br-none"
                    : "bg-white text-slate-700 rounded-bl-none border border-slate-100"
                    }`}
            >
                <p className="whitespace-pre-wrap break-words">{message.text}</p>
            </div>

            {isUser && (
                <div className="w-14 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-[10px] font-semibold ml-2 mt-1 shrink-0">
                    {t("you").slice(0, 4).toUpperCase()}
                </div>
            )}
        </div>
    );
}

export default MessageBubble;