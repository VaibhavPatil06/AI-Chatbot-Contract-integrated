"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks";
import {
  setActiveConversation,
  createConversation,
} from "@/lib/redux/slices/chatSlice";
import { toggleSidebar } from "@/lib/redux/slices/uiSlice";
import {
  MessageSquare,
  Plus,
  Settings,
  ChartBar as BarChart3,
  CreditCard,
  Menu,
  X,
  Trash2,
  Edit2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatters } from "@/lib/utils/formatters";

export default function Sidebar() {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const { conversations, activeConversationId } = useAppSelector(
    (state) => state.chat,
  );
  const { sidebarCollapsed } = useAppSelector((state) => state.ui);
  const { connected } = useAppSelector((state) => state.wallet);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const handleNewConversation = () => {
    const newConversation = {
      id: Math.random().toString(36).substr(2, 9),
      title: "New Conversation",
      messages: [],
      walletAddress: connected ? "mock-address" : "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    dispatch(createConversation(newConversation));
  };

  const handleEditTitle = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const handleSaveTitle = () => {
    // In a real app, this would update the conversation title
    setEditingId(null);
    setEditTitle("");
  };

  const navigation = [
    { icon: BarChart3, label: "Statistics", href: "/stats" },
    { icon: CreditCard, label: "Subscription", href: "/subscription" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  if (sidebarCollapsed) {
    return (
      <div className="w-16 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col items-center py-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => dispatch(toggleSidebar())}
          className="mb-4"
        >
          <Menu className="w-5 h-5" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleNewConversation}
          className="mb-4"
        >
          <Plus className="w-5 h-5" />
        </Button>

        <div className="flex flex-col gap-2">
          {navigation.map((item) => (
            <Link key={item.label} href={item.href}>
              <Button
                variant="ghost"
                size="sm"
                className={`w-10 h-10 p-0 ${
                  pathname === item.href
                    ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                    : ""
                }`}
              >
                <item.icon className="w-5 h-5" />
              </Button>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            AI Chat
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dispatch(toggleSidebar())}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <Button
          onClick={handleNewConversation}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white transition-all duration-200 active:scale-95"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Conversation
        </Button>
      </div>

      {/* Conversations */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="p-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 px-3">
              Recent Chats
            </h3>

            {conversations.length === 0 ? (
              <div className="text-center py-8 px-4">
                <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">No conversations yet</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Start a new conversation to begin chatting</p>
              </div>
            ) : (
              <div className="space-y-1">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`group relative rounded-lg p-3 cursor-pointer transition-all duration-200 ${
                      activeConversationId === conversation.id
                        ? "bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-700"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                    onClick={() =>
                      dispatch(setActiveConversation(conversation.id))
                    }
                  >
                    {editingId === conversation.id ? (
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={handleSaveTitle}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleSaveTitle()
                        }
                        className="w-full bg-transparent border-none outline-none text-sm font-medium"
                        autoFocus
                      />
                    ) : (
                      <>
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {conversation.title}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {conversation.messages.length} messages
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                              {formatters.relativeTime(conversation.updatedAt)}
                            </p>
                          </div>

                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 ml-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-6 h-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditTitle(
                                  conversation.id,
                                  conversation.title,
                                );
                              }}
                            >
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-6 h-6 p-0 text-red-500 hover:text-red-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Handle delete
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Navigation */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="space-y-1">
          {navigation.map((item) => (
            <Link key={item.label} href={item.href}>
              <Button
                variant="ghost"
                className={`w-full justify-start text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white ${
                  pathname === item.href
                    ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-semibold"
                    : ""
                }`}
              >
                <item.icon className="w-4 h-4 mr-3" />
                {item.label}
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
