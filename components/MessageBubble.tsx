"use client";
import { type FC } from "react";
import { Message } from "@/types/chat";
import { useLang } from "@/lib/language";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
                {isUser ? (
                    <p className="whitespace-pre-wrap break-words">{message.text}</p>
                ) : (
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            a: linkRenderer,
                            p: paragraphRenderer,
                            ul: unorderedListRenderer,
                            ol: orderedListRenderer,
                            li: listItemRenderer,
                            strong: strongRenderer,
                            h1: headingRenderer,
                            h2: headingRenderer,
                            h3: headingRenderer,
                        }}
                    >
                        {message.text}
                    </ReactMarkdown>
                )}
            </div>

            {isUser && (
                <div className="w-14 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-[10px] font-semibold ml-2 mt-1 shrink-0">
                    {t("you").slice(0, 4).toUpperCase()}
                </div>
            )}
        </div>
    );
};

function linkRenderer(props: { href?: string; children?: React.ReactNode }) {
    return (
        <a
            href={props.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline decoration-blue-300 underline-offset-2 hover:text-blue-800 hover:decoration-blue-500 break-all font-medium"
        >
            {props.children}
        </a>
    );
}

function paragraphRenderer(props: { children?: React.ReactNode }) {
    return (
        <p className="whitespace-pre-wrap break-words mb-3 last:mb-0">
            {props.children}
        </p>
    );
}

function unorderedListRenderer(props: { children?: React.ReactNode }) {
    return (
        <ul className="mb-3 space-y-2 last:mb-0">{props.children}</ul>
    );
}

function orderedListRenderer(props: { children?: React.ReactNode }) {
    return (
        <ol className="mb-3 space-y-2 last:mb-0 list-none counter-reset-item">
            {props.children}
        </ol>
    );
}

function listItemRenderer(props: { children?: React.ReactNode }) {
    return (
        <li className="flex gap-2.5 items-start bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100 overflow-hidden hover:bg-slate-100 transition-colors">
            <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                •
            </span>
            <span className="flex-1 leading-relaxed min-w-0 break-words">{props.children}</span>
        </li>
    );
}

function strongRenderer(props: { children?: React.ReactNode }) {
    return <strong className="font-semibold text-slate-900">{props.children}</strong>;
}

function headingRenderer(props: { children?: React.ReactNode }) {
    return (
        <h3 className="font-semibold text-slate-800 mb-2 mt-1 first:mt-0">
            {props.children}
        </h3>
    );
}

export default MessageBubble;