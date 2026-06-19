import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { LangProvider } from "@/lib/language";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Querix",
  description: "Real-time AI chatbot powered by Groq + Tavily",
};

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="bn">
      <body className={`${geist.className} antialiased`}>
        <LangProvider>{props.children}</LangProvider>
      </body>
    </html>
  );
}