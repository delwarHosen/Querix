import groq from "@/lib/groq";
import { NextRequest, NextResponse } from "next/server";
import { ChatResponse } from "@/types/chat";

// ESPN থেকে live match data
async function searchSports(isEnglish: boolean): Promise<string> {
    try {
        const res = await fetch(
            "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard",
            { next: { revalidate: 60 } }
        );
        const data = await res.json();

        if (!data.events || data.events.length === 0) {
            return isEnglish ? "No matches scheduled for today." : "আজকে কোনো ম্যাচ নেই।";
        }

        return data.events
            .map((e: any) => {
                const comp = e.competitions?.[0];
                const home = comp?.competitors?.find((c: any) => c.homeAway === "home");
                const away = comp?.competitors?.find((c: any) => c.homeAway === "away");
                const status = comp?.status?.type?.description ?? "";
                const homeScore = comp?.status?.type?.completed ? home?.score : "-";
                const awayScore = comp?.status?.type?.completed ? away?.score : "-";
                const time = new Date(e.date).toLocaleTimeString(isEnglish ? "en-US" : "bn-BD", {
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: "Asia/Dhaka",
                });
                return `${home?.team?.displayName} ${homeScore} vs ${awayScore} ${away?.team?.displayName} | ${status} | ${time} (${isEnglish ? "BST" : "BD সময়"})`;
            })
            .join("\n");
    } catch {
        return isEnglish ? "Failed to fetch sports data." : "স্পোর্টস ডেটা আনতে সমস্যা হয়েছে।";
    }
}

// Tavily web search
async function searchWeb(query: string, isEnglish: boolean): Promise<string> {
    try {
        const res = await fetch("https://api.tavily.com/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                api_key: process.env.TAVILY_API_KEY,
                query,
                search_depth: "basic",
                max_results: 5,
            }),
        });

        const data = await res.json();

        if (!data.results || data.results.length === 0) {
            return isEnglish ? "No results found on the web." : "কোনো তথ্য পাওয়া যায়নি।";
        }

        return data.results
            .map(
                (r: { title: string; content: string; url: string }) =>
                    `Title: ${r.title}\nContent: ${r.content}\nSource: ${r.url}`
            )
            .join("\n\n");
    } catch {
        return isEnglish ? "An error occurred during the web search." : "ওয়েব সার্চ করতে সমস্যা হয়েছে।";
    }
}

// Sports সম্পর্কিত কিনা চেক করুন
function isSportsQuery(message: string): boolean {
    const keywords = [
        "ম্যাচ", "বিশ্বকাপ", "খেলা", "স্কোর", "ফিফা", "ফুটবল", "গোল",
        "গোলদাতা", "সর্বোচ্চ", "golden boot",
        "match", "world cup", "score", "fifa", "football", "soccer", "goal", "top scorer",
    ];
    return keywords.some((k) => message.toLowerCase().includes(k));
}

// Scorer সম্পর্কিত কিনা চেক করুন (ESPN অনির্ভরযোগ্য, তাই Tavily route)
function isScorerQuery(message: string): boolean {
    const keywords = [
        "গোলদাতা", "সর্বোচ্চ গোল", "কে বেশি গোল", "গোল করেছে কে",
        "top scorer", "golden boot", "most goals",
    ];
    return keywords.some((k) => message.toLowerCase().includes(k));
}

// English query কিনা তা বের করার সিম্পল মেথড
function checkIsEnglish(message: string): boolean {
    const englishRegex = /^[A-Za-z0-9\s\-_.,?!@#|$%^&*()=+\[\]{}|;':",./<>?`~]*$/;
    return englishRegex.test(message);
}

// Real-time search দরকার কিনা চেক করুন
async function needsSearch(message: string): Promise<boolean> {
    const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        max_tokens: 10,
        messages: [
            {
                role: "system",
                content:
                    'You decide if a question needs a real-time web search. Reply only "yes" or "no". Say "yes" for: current news, today\'s weather, live scores, stock prices, recent events, anything time-sensitive. Say "no" for: general knowledge, math, coding, history, definitions.',
            },
            { role: "user", content: message },
        ],
    });

    const answer = completion.choices[0].message.content?.toLowerCase() ?? "";
    return answer.includes("yes");
}

export async function POST(
    req: NextRequest
): Promise<NextResponse<ChatResponse>> {
    try {
        const { message } = await req.json();

        if (!message || typeof message !== "string") {
            return NextResponse.json(
                { reply: "", error: "Message is required" },
                { status: 400 }
            );
        }

        const isEnglish = checkIsEnglish(message);

        let systemPrompt = isEnglish
            ? "You are a helpful AI assistant with access to real-time web search results. Use the search results below to answer the user's question accurately in English. Only cite URLs that are EXACTLY as given in the search results below — never modify, shorten, or guess a URL. Use markdown link format [Source Name](exact URL from results). If unsure of a URL, don't include it. If no data is found, politely reply in English."
            : "You are a helpful AI assistant with access to real-time web search results. Use the search results below to answer the user's question accurately. Answer in the same language the user uses. Only cite URLs that are EXACTLY as given in the search results below — never modify, shorten, or guess a URL. Use markdown link format [উৎসের নাম](exact URL from results). If unsure of a URL, don't include it. If no data is found, politely reply in Bengali.";

        let userContent = message;

        if (isSportsQuery(message)) {
            let sportsData: string;

            if (isScorerQuery(message)) {
                // ESPN leaders endpoint অনির্ভরযোগ্য, তাই Tavily দিয়ে search
                sportsData = await searchWeb(
                    `${message} FIFA World Cup 2026 latest golden boot standings`,
                    isEnglish
                );
            } else {
                sportsData = await searchSports(isEnglish);
            }

            systemPrompt = isEnglish
                ? "You are a helpful AI assistant with access to live sports data. Use the data below to answer accurately in English. If data contains errors or states unavailability, explain it in English."
                : "You are a helpful AI assistant with access to live sports data. Use the data below to answer accurately. Answer in the same language the user uses. If data contains errors or states unavailability, explain it in Bengali.";

            userContent = `User question: ${message}\n\nLive sports data:\n${sportsData}`;
        } else if (process.env.TAVILY_API_KEY && (await needsSearch(message))) {
            const webResults = await searchWeb(message, isEnglish);
            systemPrompt = isEnglish
                ? "You are a helpful AI assistant with access to real-time web search results. Use the search results below to answer the user's question accurately in English. Always mention your sources. If no data is found, politely reply in English."
                : "You are a helpful AI assistant with access to real-time web search results. Use the search results below to answer the user's question accurately. Answer in the same language the user uses. Always mention your sources. If no data is found, politely reply in Bengali.";

            userContent = `User question: ${message}\n\nWeb search results:\n${webResults}`;
        }

        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userContent },
            ],
        });

        const reply = completion.choices[0].message.content ?? "";
        return NextResponse.json({ reply });
    } catch (error) {
        console.error("Chat API error:", error);
        return NextResponse.json(
            { reply: "", error: "Something went wrong" },
            { status: 500 }
        );
    }
}