'use client';

import { useState } from 'react';
import { ChatMessage as ChatMessageType } from '@/types';
import { Bot, User, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatters } from '@/lib/utils/formatters';
import CodeFormatter from './CodeFormatter';

interface ChatMessageProps {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const renderContent = () => {
    const content = message.content;
    
    // Check if content contains code blocks
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts: (string | { type: 'code'; language: string; code: string })[] = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push(content.slice(lastIndex, match.index));
      }
      
      // Add code block
      parts.push({
        type: 'code',
        language: match[1] || 'text',
        code: match[2],
      });
      
      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(content.slice(lastIndex));
    }

    // If no code blocks found, return plain text
    if (parts.length === 0) {
      return <p className="whitespace-pre-wrap leading-relaxed">{content}</p>;
    }

    return parts.map((part, index) => {
      if (typeof part === 'string') {
        return (
          <p key={index} className="whitespace-pre-wrap leading-relaxed mb-4">
            {part}
          </p>
        );
      } else {
        return (
          <CodeFormatter
            key={index}
            code={part.code}
            language={part.language}
          />
        );
      }
    });
  };

  return (
    <div className={`flex gap-4 p-6 ${isUser ? 'bg-gray-50 dark:bg-gray-800/50' : 'bg-white dark:bg-gray-900'}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser 
          ? 'bg-gradient-to-br from-indigo-500 to-purple-600' 
          : 'bg-gradient-to-br from-emerald-500 to-teal-600'
      }`}>
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              {isUser ? 'You' : 'AI Assistant'}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatters.time(message.timestamp)}
            </p>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 p-0"
          >
            {copied ? (
              <Check className="w-3 h-3 text-green-600" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </Button>
        </div>

        <div className="prose dark:prose-invert max-w-none">
          {renderContent()}
        </div>

        {message.isStreaming && (
          <div className="flex items-center gap-1 mt-2">
            <div className="w-1 h-1 bg-indigo-500 rounded-full animate-pulse" />
            <div className="w-1 h-1 bg-indigo-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }} />
            <div className="w-1 h-1 bg-indigo-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
            <span className="text-xs text-gray-500 ml-2">AI is thinking...</span>
          </div>
        )}
      </div>
    </div>
  );
}