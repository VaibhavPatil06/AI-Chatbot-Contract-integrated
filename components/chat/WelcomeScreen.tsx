"use client";

import { Zap, MessageSquare, Brain, Zeta } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface WelcomeScreenProps {
  onNewConversation: () => void;
}

export default function WelcomeScreen({
  onNewConversation,
}: WelcomeScreenProps) {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Responses",
      description: "Get intelligent answers powered by advanced AI models",
    },
    {
      icon: MessageSquare,
      title: "Chat History",
      description: "Keep track of all your conversations in one place",
    },
    {
      icon: Zap,
      title: "Fast & Reliable",
      description: "Lightning-fast responses with 99.9% uptime",
    },
  ];

  return (
    <div className="h-full flex flex-col items-center justify-center px-4 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Welcome to AI Chat Pro
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Start chatting with our advanced AI assistant. Free forever, no
            signup required.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-4">
          {features.map((feature, idx) => (
            <Card
              key={idx}
              className="p-6 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
            >
              <feature.icon className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>

        {/* CTA Button */}
        <div className="space-y-4">
          <Button
            onClick={onNewConversation}
            className="w-full md:w-64 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-lg font-semibold rounded-lg transition-all duration-200 active:scale-95"
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            Start New Conversation
          </Button>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            💡 Tip: Use Shift+Enter for new lines, Enter to send
          </p>
        </div>

        {/* Footer Info */}
        <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="grid md:grid-cols-3 gap-8 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <p className="font-semibold text-gray-900 dark:text-white mb-1">
                Free Forever
              </p>
              <p>No credit card required</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white mb-1">
                Unlimited Chats
              </p>
              <p>Create as many conversations as you want</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white mb-1">
                Privacy First
              </p>
              <p>Your data is yours alone</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
