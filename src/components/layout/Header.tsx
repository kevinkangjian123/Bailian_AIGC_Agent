import React from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { NodeID } from "@/types";

interface HeaderProps {
  appName: string;
  lockChain: Record<NodeID, boolean>;
  currentNode: NodeID;
  progressValue: number;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export function Header({ 
  appName, 
  lockChain, 
  currentNode, 
  progressValue, 
  isMobileMenuOpen, 
  setIsMobileMenuOpen 
}: HeaderProps) {
  return (
    <header className="h-16 border-b bg-white flex items-center px-6 justify-between z-50">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-[#C8102E] rounded-sm flex items-center justify-center text-white font-bold">B</div>
        <h1 className="font-bold text-lg hidden sm:block">
          {appName}
        </h1>
      </div>
      
      <div className="flex-1 max-w-2xl px-12 hidden md:block">
        <div className="flex justify-between mb-2 px-1">
          {Object.values(NodeID).map((node) => (
            <div 
              key={node} 
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-500",
                lockChain[node] ? "bg-green-500" : 
                currentNode === node ? "bg-[#C8102E] animate-pulse scale-125" : "bg-gray-200"
              )}
            />
          ))}
        </div>
        <Progress value={progressValue} className="h-1" />
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </Button>
        <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500 font-medium uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          Live Agentic Workflow
        </div>
      </div>
    </header>
  );
}
