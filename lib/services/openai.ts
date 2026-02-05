import { ChatMessage } from "@/types";

// Simulated AI responses with code examples
const codeExamples = [
  {
    language: "javascript",
    code: `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10)); // Output: 55`,
    explanation:
      "This is a recursive implementation of the Fibonacci sequence. Each call breaks down the problem into smaller subproblems.",
  },
  {
    language: "python",
    code: `import asyncio
import aiohttp

async def fetch_data(session, url):
    async with session.get(url) as response:
        return await response.json()

async def main():
    async with aiohttp.ClientSession() as session:
        data = await fetch_data(session, 'https://api.example.com/data')
        print(data)

asyncio.run(main())`,
    explanation:
      "This example demonstrates how to make asynchronous HTTP requests in Python using aiohttp. The async/await pattern allows non-blocking I/O operations.",
  },
  {
    language: "typescript",
    code: `interface User {
  id: string;
  name: string;
  email: string;
}

class UserService {
  private users: Map<string, User> = new Map();

  async createUser(userData: Omit<User, 'id'>): Promise<User> {
    const user: User = {
      id: crypto.randomUUID(),
      ...userData,
    };
    
    this.users.set(user.id, user);
    return user;
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }
}`,
    explanation:
      "A TypeScript service class with proper typing and async methods. This demonstrates strong typing and class-based service architecture.",
  },
  {
    language: "solidity",
    code: `pragma solidity ^0.8.0;

contract SimpleCounter {
    uint256 public count = 0;

    function increment() public {
        count += 1;
    }

    function decrement() public {
        require(count > 0, "Count cannot be negative");
        count -= 1;
    }

    function getCount() public view returns (uint256) {
        return count;
    }
}`,
    explanation:
      "A basic Solidity smart contract demonstrating state management and public functions for a simple counter application.",
  },
  {
    language: "react",
    code: `import React, { useState, useEffect } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser(userId).then(data => {
      setUser(data);
      setLoading(false);
    });
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  return <div>{user?.name}</div>;
}`,
    explanation:
      "A React component demonstrating hooks for state management and side effects. The component fetches user data when the userId prop changes.",
  },
];

const generalResponses = [
  "That's an interesting question! Let me help you understand this concept better. Here are the key points:",
  "I can definitely help you with that. Here's a comprehensive explanation:",
  "Great question! This is a common challenge in development. Let me break it down for you:",
  "I understand what you're asking. Here's a detailed approach with best practices:",
  "That's a smart question that many developers encounter. Let me explain the solution:",
];

const keywords = {
  blockchain: [
    "solidity",
    "ethereum",
    "smart contract",
    "web3",
    "blockchain",
    "nft",
    "crypto",
  ],
  frontend: [
    "react",
    "vue",
    "angular",
    "typescript",
    "jsx",
    "component",
    "ui",
    "css",
  ],
  backend: [
    "nodejs",
    "express",
    "database",
    "api",
    "rest",
    "server",
    "backend",
  ],
  python: ["python", "django", "flask", "pandas", "numpy", "async"],
  javascript: ["javascript", "js", "node", "npm", "webpack", "babel"],
};

export const openAIService = {
  /**
   * Generate a streaming response based on user message
   */
  async *generateResponse(
    messages: ChatMessage[],
  ): AsyncGenerator<string, void, unknown> {
    const lastMessage = messages[messages.length - 1];
    const messageContent = lastMessage.content.toLowerCase();

    let response = "";
    let selectedExample = null;

    // Detect if user is asking for code
    const isCodeRequest =
      /code|example|implement|function|class|algorithm|script|how to|write|create|build/i.test(
        lastMessage.content,
      );

    // Detect language/topic from message
    let selectedLanguage = "javascript";
    if (
      messageContent.includes("solidity") ||
      messageContent.includes("ethereum") ||
      messageContent.includes("smart contract")
    ) {
      selectedLanguage = "solidity";
    } else if (messageContent.includes("python")) {
      selectedLanguage = "python";
    } else if (
      messageContent.includes("typescript") ||
      messageContent.includes("react")
    ) {
      selectedLanguage = "typescript";
    } else if (messageContent.includes("react")) {
      selectedLanguage = "react";
    }

    if (isCodeRequest) {
      // Find matching code example based on language/topic
      const matching = codeExamples.filter(
        (ex) =>
          ex.language === selectedLanguage || ex.language === "javascript", // fallback
      );
      selectedExample =
        matching[Math.floor(Math.random() * matching.length)] ||
        codeExamples[0];

      response = `${selectedExample.explanation}\n\nHere's a practical example:\n\n\`\`\`${selectedExample.language}\n${selectedExample.code}\n\`\`\`\n\n**Key takeaways:**\n• This solution is efficient and follows best practices\n• You can adapt this pattern to your specific use case\n• Consider edge cases and error handling when implementing\n\nWould you like me to explain any specific part of the code or discuss potential improvements?`;
    } else {
      const intro =
        generalResponses[Math.floor(Math.random() * generalResponses.length)];
      response = `${intro}\n\n**Understanding your question:** "${lastMessage.content}"\n\n**Key concepts:**\n• This involves multiple aspects of modern development\n• There are several approaches you can take depending on your context\n• The best solution depends on your specific requirements and constraints\n\n**Practical approach:**\n1. Analyze your requirements and constraints\n2. Consider performance and scalability implications\n3. Implement incrementally with proper testing\n4. Monitor and optimize based on real-world usage\n\n**Next steps:**\nWould you like me to provide a code example, dive deeper into any particular aspect, or discuss best practices for this topic?`;
    }

    // Simulate streaming response with variable speed
    const words = response.split(" ");
    for (let i = 0; i < words.length; i++) {
      const word = words[i];

      // Simulate typing speed variation
      let delay = 30 + Math.random() * 50; // Normal speed

      // Slow down at punctuation
      if (word.includes(".") || word.includes(",") || word.includes(":")) {
        delay += 100;
      }

      // Faster at beginning, slower at code blocks
      if (response.includes("```")) {
        delay += 20;
      }

      const chunk = i === 0 ? word : " " + word;
      await new Promise((resolve) => setTimeout(resolve, delay));
      yield chunk;
    }
  },

  /**
   * Generate a title for a conversation based on first message
   */
  async generateTitle(messages: ChatMessage[]): Promise<string> {
    const firstUserMessage =
      messages.find((m) => m.role === "user")?.content || "";

    // Extract meaningful title from first message
    const titleWords = firstUserMessage
      .split(" ")
      .slice(0, 8)
      .filter((word) => word.length > 2); // Skip small words

    let title = titleWords.join(" ").trim();

    // Clean up title
    if (title.length > 50) {
      title = title.substring(0, 47) + "...";
    }

    return title || "New Conversation";
  },

  /**
   * Simulate typing indicator
   */
  async *simulateTyping(
    duration: number = 2000,
  ): AsyncGenerator<string, void, unknown> {
    const dots = ["", ".", "..", "..."];
    const interval = duration / 20;

    for (let i = 0; i < 20; i++) {
      const dotState = dots[i % dots.length];
      yield `AI is thinking${dotState}`;
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  },

  /**
   * Check if message requires subscription
   */
  requiresSubscription(message: string): boolean {
    // All messages require subscription for premium features
    return true;
  },

  /**
   * Detect message language/topic
   */
  detectLanguage(message: string): string {
    const lower = message.toLowerCase();

    for (const [lang, keywords_list] of Object.entries(keywords)) {
      if (keywords_list.some((kw) => lower.includes(kw))) {
        return lang;
      }
    }

    return "general";
  },
};
