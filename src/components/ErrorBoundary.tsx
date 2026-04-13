import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "./ui/Button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center border border-red-100">
            <div className="w-16 h-16 bg-red-50 text-[#C8102E] rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">抱歉，系统遇到了一点小麻烦</h2>
            <p className="text-gray-500 mb-8 text-sm leading-relaxed">
              可能是 AI 返回的数据格式不兼容，或者是网络连接波动。别担心，您可以尝试刷新页面恢复。
            </p>
            <Button 
              onClick={() => window.location.reload()}
              className="w-full h-12 bg-[#C8102E] hover:bg-[#A00D25] text-white font-bold rounded-xl flex items-center justify-center gap-2"
            >
              <RefreshCcw size={18} />
              刷新并重试
            </Button>
            {process.env.NODE_ENV === 'development' && (
              <pre className="mt-6 p-4 bg-gray-900 text-red-400 text-[10px] text-left rounded-lg overflow-auto max-h-40">
                {this.state.error?.toString()}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.children;
  }
}
