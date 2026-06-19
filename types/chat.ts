export interface Message {
  role: "user" | "bot";
  text: string;
  isSearching?: boolean;
}

export interface ChatResponse {
  reply: string;
  error?: string;
}