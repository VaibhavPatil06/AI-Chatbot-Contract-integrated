"use client";

import { useState, useRef, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { sendMessage, setCurrentMessage } from "@/lib/redux/slices/chatSlice";
import { Send, Paperclip, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const dispatch = useAppDispatch();
  const { currentMessage, isStreaming } = useAppSelector((state) => state.chat);
  const { queriesRemaining } = useAppSelector((state) => state.subscription);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentMessage.trim() || isStreaming || disabled) {
      return;
    }

    onSendMessage(currentMessage.trim());
    dispatch(setCurrentMessage(""));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [currentMessage]);

  const isDisabled = disabled || isStreaming;

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="relative">
          <div className="flex items-end gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-colors">
            {/* Input area */}
            <div className="flex-1">
              <Textarea
                ref={textareaRef}
                value={currentMessage}
                onChange={(e) => dispatch(setCurrentMessage(e.target.value))}
                onKeyDown={handleKeyDown}
                placeholder="Type your message here... (Press Enter to send, Shift+Enter for new line)"
                disabled={isDisabled}
                className="min-h-[20px] max-h-32 resize-none bg-transparent border-0 p-0 focus:ring-0 focus-visible:ring-0"
                rows={1}
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-8 h-8 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                disabled={isDisabled}
              >
                <Paperclip className="w-4 h-4" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-8 h-8 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                disabled={isDisabled}
              >
                <Mic className="w-4 h-4" />
              </Button>

              <Button
                type="submit"
                disabled={isDisabled || !currentMessage.trim()}
                className="w-8 h-8 p-0 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Query limit warning */}
          {queriesRemaining <= 10 && queriesRemaining > 0 && (
            <div className="mt-2 text-sm text-amber-600 dark:text-amber-400">
              ⚠️ {queriesRemaining} queries remaining in your current plan
            </div>
          )}

          {queriesRemaining === 0 && (
            <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    Query limit reached
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Upgrade your plan to continue chatting with AI
                  </p>
                </div>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
                >
                  Upgrade Now
                </Button>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
