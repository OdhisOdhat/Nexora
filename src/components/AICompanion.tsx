import { Sparkles, X, Send, Bot, User, HelpCircle, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import React, { useState, useRef, useEffect } from "react";
import { ChatMessage } from "../types";

interface AICompanionProps {
  onSuggestAction: (actionType: string, param?: string) => void;
}

export default function AICompanion({ onSuggestAction }: AICompanionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOfflineWarning, setIsOfflineWarning] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Load chat histories dynamically from database logs when panel opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchChatLogs = async () => {
      try {
        const response = await fetch(`/api/chats?email=${encodeURIComponent("fodhis1@gmail.com")}`);
        if (response.ok) {
          const list = await response.json();
          if (list && list.length > 0) {
            const parsedList = list.map((msg: any) => ({
              id: msg.id,
              role: msg.role,
              content: msg.content,
              timestamp: new Date(msg.timestamp)
            }));
            setMessages(parsedList);
          } else {
            // Default greeting if log empty
            setMessages([
              {
                id: "initial-msg",
                role: "assistant",
                content: "### Welcome to Nexora AI! 🌟🤖\n\nI am your **futuristic Shopping Co-Pilot**. I can analyze our entire live item inventory to recommend the best custom gear for you!\n\n**Ask me anything like:**\n- *'Recommend active running shoes.'*\n- *'Suggest a multi-functional smartwatch.'*\n- *'Are there items with active discount sales?'*\n\nHow can I style your wardrobe or workspace today?",
                timestamp: new Date(),
              }
            ]);
          }
        }
      } catch (err) {
        console.error("Failed to load background chats:", err);
      }
    };
    fetchChatLogs();
  }, [isOpen]);

  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading) return;

    // Append user message
    const userMsg: ChatMessage = {
      id: "usr-" + Date.now(),
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);

    try {
      // Create chat history structured format for server-side
      const chatHistory = messages
        .filter(m => m.id !== "initial-msg")
        .map(m => ({
          role: m.role,
          content: m.content
        }))
        .slice(-6); // Only send last 6 messages to stay lightweight

      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, chatHistory, email: "fodhis1@gmail.com" }),
      });

      if (!response.ok) {
        throw new Error("Failed to send queries");
      }

      const data = await response.json();
      
      const assistantMsg: ChatMessage = {
        id: "ast-" + Date.now(),
        role: "assistant",
        content: data.response || "No data received. Please retry.",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMsg]);
      setIsOfflineWarning(!!data.isOfflineMode);

    } catch (err: any) {
      console.error(err);
      const errMessage: ChatMessage = {
        id: "err-" + Date.now(),
        role: "assistant",
        content: `### Connection Error 📡🚫\n\nI was unable to synchronize with Nexora's recommendation engine right now. Let's try matching again in a brief second.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const submitText = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  const handleChipClick = (chipText: string) => {
    handleSendMessage(chipText);
  };

  const suggestionChips = [
    { text: "Suggest smartwatch pro", label: "Smart Watch info" },
    { text: "What sports gear is in stock?", label: "Sports Accessories" },
    { text: "Are there any items with discounts under Deals?", label: "Hot Deals Items" },
    { text: "Explain Nexora Prime benefits", label: "Nexora Prime benefits" },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40 select-none">
      <AnimatePresence>
        {isOpen ? (
          /* Opened Chat Panel */
          <motion.div
            id="ai-helper-chatpanel"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="w-[90vw] sm:w-[410px] h-[550px] bg-slate-950 border border-purple-500/25 rounded-3xl overflow-hidden shadow-2xl flex flex-col glow-accent"
          >
            {/* Header section */}
            <div className="bg-gradient-to-r from-indigo-950 to-slate-950 px-5 py-4 border-b border-white/[0.04] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-300">
                  <Sparkles className="w-4 h-4 text-purple-300 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-sans font-bold text-sm text-purple-100">Nexora AI Shopping Co-Pilot</h4>
                  <span className="text-[9px] block text-green-400 font-mono">CORE STATUS: OPERATIONAL</span>
                </div>
              </div>
              <button
                id="ai-helper-close-btn"
                aria-label="Close AI Companion"
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-slate-800 text-gray-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Offline notification banner */}
            {isOfflineWarning && (
              <div className="px-5 py-2.5 bg-yellow-500/10 text-yellow-500 text-[10px] font-mono border-b border-yellow-500/10 flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Running in Smart Offline Demo Mode. Setup API key to ignite Live Model.</span>
              </div>
            )}

            {/* Scrollable messages context */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-950">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-3 max-w-[85%] ${m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                >
                  <div className={`w-7 h-7 shrink-0 rounded-lg flex items-center justify-center text-xs
                    ${m.role === "user" ? "bg-nexora-primary text-white" : "bg-purple-500/15 text-purple-300 border border-purple-500/20"}`}
                  >
                    {m.role === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                    m.role === "user" 
                      ? "bg-nexora-primary text-white rounded-tr-none" 
                      : "bg-slate-900 border border-white/[0.04] text-gray-300 rounded-tl-none"
                    }`}
                  >
                    {/* Render basic custom markdown parser for bullet lists / bold words */}
                    <div className="whitespace-pre-wrap space-y-2">
                      {m.content.split("\n\n").map((para, pIdx) => {
                        // Check if paragraph is a heading or markdown list
                        if (para.startsWith("###")) {
                          return <h5 key={pIdx} className="font-bold text-gray-100 text-xs mt-1">{para.replace("###", "")}</h5>;
                        }
                        return (
                          <p key={pIdx}>
                            {para.split("\n").map((line, lIdx) => {
                              if (line.trim().startsWith("-") || line.trim().startsWith("*")) {
                                // Bold substitution
                                return (
                                  <span key={lIdx} className="block pl-3 relative text-[11px] mt-0.5 text-gray-400">
                                    <span className="absolute left-0 text-purple-400">•</span>
                                    {line.replace(/^[-*]\s*/, "").split("**").map((tok, tIdx) => 
                                      tIdx % 2 === 1 ? <strong key={tIdx} className="text-purple-300 font-semibold">{tok}</strong> : tok
                                    )}
                                  </span>
                                );
                              }
                              // Replace strong tags
                              return (
                                <span key={lIdx} className="block">
                                  {line.split("**").map((tok, tIdx) => 
                                    tIdx % 2 === 1 ? <strong key={tIdx} className="text-purple-300 font-semibold">{tok}</strong> : tok
                                  )}
                                </span>
                              );
                            })}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing indicators */}
              {isLoading && (
                <div className="flex gap-3 items-center mr-auto max-w-[85%]">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="p-3 bg-slate-900 border border-white/[0.04] rounded-2xl rounded-tl-none">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick action chips triggers */}
            <div className="px-5 py-2 hover:py-3 transition-all border-t border-white/[0.04] bg-slate-900/30">
              <div className="flex gap-1.5 overflow-x-auto pb-1.5 select-none no-scrollbar">
                {suggestionChips.map((chip, i) => (
                  <button
                    key={i}
                    id={`ai-helper-chip-${i}`}
                    onClick={() => handleChipClick(chip.text)}
                    className="shrink-0 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-[10px] text-gray-400 hover:text-purple-300 border border-white/[0.04] rounded-full transition-colors cursor-pointer"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer Form input */}
            <form id="ai-helper-chat-form" onSubmit={submitText} className="p-4 border-t border-white/[0.04] flex items-center gap-2">
              <input
                id="ai-helper-chat-input"
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask Nexora AI for recommendations..."
                className="flex-1 px-4 py-2.5 bg-slate-900 border border-white/[0.06] focus:border-purple-500/40 rounded-xl text-xs text-white focus:outline-none placeholder-gray-500"
              />
              <button
                id="ai-helper-send-btn"
                aria-label="Send message to AI Companion"
                type="submit"
                className="p-3 bg-nexora-primary hover:bg-nexora-primary-hover text-white rounded-xl shadow-lg hover:shadow-purple-500/20 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        ) : (
          /* Circular Closed Bubble button */
          <motion.button
            id="ai-helper-bubble-btn"
            aria-label="Open AI helper chat"
            onClick={() => setIsOpen(true)}
            initial={{ scale: 0.8 }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="w-14 h-14 bg-nexora-primary hover:bg-nexora-primary-hover rounded-full flex items-center justify-center shadow-xl glow-primary cursor-pointer active:scale-90 transition-transform"
          >
            <Sparkles className="w-6 h-6 text-white animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
