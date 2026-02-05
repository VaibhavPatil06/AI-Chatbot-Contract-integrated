"use client";

import { useEffect, useRef } from "react";
import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks";
import {
  addMessage,
  startStreaming,
  updateStreamingMessage,
  createConversation,
} from "@/lib/redux/slices/chatSlice";
import ChatMessage from "../chat/ChatMessage";
import ChatInput from "../chat/ChatInput";
import WelcomeScreen from "../chat/WelcomeScreen";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare } from "lucide-react";

export default function ChatLayout() {
  const dispatch = useAppDispatch();
  const { conversations, activeConversationId, isStreaming } = useAppSelector(
    (state) => state.chat,
  );
  const { address } = useAppSelector((state) => state.wallet);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId,
  );

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeConversation?.messages.length, isStreaming]);

  const handleSendMessage = async (message: string) => {
    let conversationId = activeConversationId;

    // Create new conversation if none is active
    if (!conversationId) {
      conversationId = Math.random().toString(36).substr(2, 9);
      const newConversation = {
        id: conversationId,
        title: message.slice(0, 50) + (message.length > 50 ? "..." : ""),
        messages: [],
        walletAddress: address || "",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      dispatch(createConversation(newConversation));
    }

    // Add user message
    const userMessage = {
      id: Math.random().toString(36).substr(2, 9),
      role: "user" as const,
      content: message,
      timestamp: new Date(),
    };
    dispatch(addMessage({ conversationId, message: userMessage }));

    // Create placeholder for AI response
    const assistantMessageId = Math.random().toString(36).substr(2, 9);
    const assistantMessage = {
      id: assistantMessageId,
      role: "assistant" as const,
      content: "",
      timestamp: new Date(),
      isStreaming: true,
    };
    dispatch(addMessage({ conversationId, message: assistantMessage }));
    dispatch(startStreaming(assistantMessageId));

    try {
      // Send request to API (free tier - no subscription checks)
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          message,
          walletAddress: address || "anonymous",
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to send message");
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));

                if (data.type === "chunk") {
                  dispatch(
                    updateStreamingMessage({
                      messageId: assistantMessageId,
                      content: data.content,
                    }),
                  );
                } else if (data.type === "complete") {
                  dispatch(
                    updateStreamingMessage({
                      messageId: assistantMessageId,
                      content: data.content,
                      isComplete: true,
                    }),
                  );
                }
              } catch (error) {
                console.error("Error parsing SSE data:", error);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Handle error - update the assistant message to show error
      dispatch(
        updateStreamingMessage({
          messageId: assistantMessageId,
          content:
            "Sorry, I encountered an error processing your message. Please try again.",
          isComplete: true,
        }),
      );
    }
  };

  if (!activeConversation) {
    return (
      <div className="flex flex-col h-full">
        <WelcomeScreen
          onNewConversation={() => {
            const newConversation = {
              id: Math.random().toString(36).substr(2, 9),
              title: "New Conversation",
              messages: [],
              walletAddress: "",
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            dispatch(createConversation(newConversation));
          }}
        />
        <ChatInput onSendMessage={handleSendMessage} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {activeConversation.messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>
      </div>

      {/* Input area */}
      <ChatInput onSendMessage={handleSendMessage} disabled={!isStreaming} />
    </div>
  );
}
