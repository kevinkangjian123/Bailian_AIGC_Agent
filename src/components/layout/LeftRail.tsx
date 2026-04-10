import React from "react";
import { motion } from "motion/react";
import { Sparkles, User, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Message {
  role: "ai" | "user";
  content: string;
}

interface LeftRailProps {
  isMobileMenuOpen: boolean;
  messages: Message[];
  isTyping: boolean;
  scrollRef: React.RefObject<HTMLDivElement>;
  userInput: string;
  setUserInput: (val: string) => void;
  onSendMessage: (content: string) => void;
}

export function LeftRail({ 
  isMobileMenuOpen, 
  messages, 
  isTyping, 
  scrollRef,
  userInput,
  setUserInput,
  onSendMessage
}: LeftRailProps) {
  return (
    <section className={cn(
      "flex-col border-r bg-white transition-all duration-300 z-40",
      "fixed inset-0 top-16 md:relative md:inset-auto md:flex md:w-[40%] lg:w-[35%]",
      isMobileMenuOpen ? "flex" : "hidden md:flex"
    )}>
      <div className="p-4 border-b bg-gray-50/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#C8102E]" />
          <span className="font-bold text-sm uppercase tracking-tighter">Brain Orchestrator</span>
        </div>
        <span className="text-[10px] bg-gray-200 px-2 py-0.5 rounded-full font-mono">v2.0.26</span>
      </div>
      
      <ScrollArea className="flex-1 p-6" ref={scrollRef}>
        <div className="space-y-6">
          {messages.map((msg, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-3 max-w-[90%]",
                msg.role === "user" ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                msg.role === "ai" ? "bg-[#C8102E] text-white" : "bg-gray-200 text-gray-600"
              )}>
                {msg.role === "ai" ? <Sparkles size={14} /> : <User size={14} />}
              </div>
              <div className={cn(
                "p-4 rounded-2xl text-sm leading-relaxed",
                msg.role === "ai" ? "bg-gray-100 rounded-tl-none" : "bg-[#C8102E] text-white rounded-tr-none"
              )}>
                {msg.content}
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[#C8102E] text-white flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-gray-100 p-4 rounded-2xl rounded-tl-none flex gap-1">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-white">
        <div className="relative">
          <textarea 
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSendMessage(userInput);
              }
            }}
            placeholder="输入指令或反馈..."
            className="w-full bg-gray-50 border-none rounded-xl p-4 pr-12 text-sm focus:ring-1 focus:ring-[#C8102E] resize-none h-20"
          />
          <Button 
            size="icon" 
            onClick={() => onSendMessage(userInput)}
            className="absolute bottom-3 right-3 bg-[#C8102E] hover:bg-[#A00D25] rounded-lg"
          >
            <Send size={16} />
          </Button>
        </div>
      </div>
    </section>
  );
}
