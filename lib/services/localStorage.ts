import { Conversation, User } from "@/types";

const STORAGE_KEYS = {
  CONVERSATIONS: "ai-chat-conversations",
  USER_DATA: "ai-chat-user",
  THEME: "ai-chat-theme",
  WALLET: "ai-chat-wallet",
  SUBSCRIPTION: "ai-chat-subscription",
  CHAT_HISTORY: "ai-chat-history",
} as const;

export const localStorageService = {
  // Conversation management
  getConversations: (walletAddress?: string): Conversation[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
      const conversations = data ? JSON.parse(data) : [];

      if (walletAddress) {
        return conversations.filter(
          (c: Conversation) => c.walletAddress === walletAddress.toLowerCase(),
        );
      }

      return conversations;
    } catch (error) {
      console.error("Error loading conversations:", error);
      return [];
    }
  },

  saveConversation: (conversation: Conversation): void => {
    try {
      const conversations = localStorageService.getConversations();
      const existingIndex = conversations.findIndex(
        (c) => c.id === conversation.id,
      );

      if (existingIndex >= 0) {
        conversations[existingIndex] = conversation;
      } else {
        conversations.unshift(conversation);
      }

      // Keep only last 100 conversations to avoid storage issues
      if (conversations.length > 100) {
        conversations.splice(100);
      }

      localStorage.setItem(
        STORAGE_KEYS.CONVERSATIONS,
        JSON.stringify(conversations),
      );
    } catch (error) {
      console.error("Failed to save conversation:", error);
    }
  },

  deleteConversation: (conversationId: string): void => {
    try {
      const conversations = localStorageService.getConversations();
      const filtered = conversations.filter((c) => c.id !== conversationId);
      localStorage.setItem(
        STORAGE_KEYS.CONVERSATIONS,
        JSON.stringify(filtered),
      );
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  },

  clearConversations: (walletAddress?: string): void => {
    try {
      if (walletAddress) {
        const conversations = localStorageService.getConversations();
        const filtered = conversations.filter(
          (c) => c.walletAddress !== walletAddress.toLowerCase(),
        );
        localStorage.setItem(
          STORAGE_KEYS.CONVERSATIONS,
          JSON.stringify(filtered),
        );
      } else {
        localStorage.removeItem(STORAGE_KEYS.CONVERSATIONS);
      }
    } catch (error) {
      console.error("Failed to clear conversations:", error);
    }
  },

  // User data management
  getUserData: (): Partial<User> | null => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Error loading user data:", error);
      return null;
    }
  },

  saveUserData: (userData: Partial<User>): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    } catch (error) {
      console.error("Failed to save user data:", error);
    }
  },

  // Subscription data management
  getSubscription: (walletAddress?: string): any => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION);
      if (!data) return null;

      const subscription = JSON.parse(data);

      // If wallet is specified, return only if it matches
      if (
        walletAddress &&
        subscription.walletAddress !== walletAddress.toLowerCase()
      ) {
        return null;
      }

      // Check if subscription is expired
      if (subscription.expiryDate) {
        const expiryDate = new Date(subscription.expiryDate);
        if (expiryDate < new Date() && !subscription.autoRenew) {
          subscription.status = "expired";
        }
      }

      return subscription;
    } catch (error) {
      console.error("Error loading subscription:", error);
      return null;
    }
  },

  saveSubscription: (subscription: any): void => {
    try {
      // Store subscription in localStorage
      localStorage.setItem(
        STORAGE_KEYS.SUBSCRIPTION,
        JSON.stringify({
          ...subscription,
          savedAt: new Date().toISOString(),
        }),
      );
    } catch (error) {
      console.error("Failed to save subscription:", error);
    }
  },

  clearSubscription: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEYS.SUBSCRIPTION);
    } catch (error) {
      console.error("Failed to clear subscription:", error);
    }
  },

  // Theme management
  getTheme: (): "light" | "dark" => {
    try {
      return (
        (localStorage.getItem(STORAGE_KEYS.THEME) as "light" | "dark") ||
        "light"
      );
    } catch {
      return "light";
    }
  },

  saveTheme: (theme: "light" | "dark"): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch (error) {
      console.error("Failed to save theme:", error);
    }
  },

  // Wallet data
  getWalletData: (): any => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WALLET);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Error loading wallet data:", error);
      return null;
    }
  },

  saveWalletData: (walletData: any): void => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.WALLET,
        JSON.stringify({
          ...walletData,
          savedAt: new Date().toISOString(),
        }),
      );
    } catch (error) {
      console.error("Failed to save wallet data:", error);
    }
  },

  // Chat history (messages)
  saveChatMessage: (conversationId: string, message: any): void => {
    try {
      const history = localStorageService.getChatHistory(conversationId);
      history.push({
        ...message,
        savedAt: new Date().toISOString(),
      });

      // Keep only last 500 messages per conversation
      if (history.length > 500) {
        history.splice(0, history.length - 500);
      }

      localStorage.setItem(
        `${STORAGE_KEYS.CHAT_HISTORY}_${conversationId}`,
        JSON.stringify(history),
      );
    } catch (error) {
      console.error("Failed to save chat message:", error);
    }
  },

  getChatHistory: (conversationId: string): any[] => {
    try {
      const data = localStorage.getItem(
        `${STORAGE_KEYS.CHAT_HISTORY}_${conversationId}`,
      );
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error loading chat history:", error);
      return [];
    }
  },

  // Export/Import functionality
  exportData: (walletAddress?: string): string => {
    try {
      const data = {
        conversations: localStorageService.getConversations(walletAddress),
        userData: localStorageService.getUserData(),
        subscription: walletAddress
          ? localStorageService.getSubscription(walletAddress)
          : null,
        theme: localStorageService.getTheme(),
        exportDate: new Date().toISOString(),
        walletAddress: walletAddress || null,
      };

      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error("Failed to export data:", error);
      return "";
    }
  },

  importData: (jsonData: string): boolean => {
    try {
      const data = JSON.parse(jsonData);

      if (data.conversations && Array.isArray(data.conversations)) {
        const existing = localStorageService.getConversations();
        const merged = [...existing, ...data.conversations];
        localStorage.setItem(
          STORAGE_KEYS.CONVERSATIONS,
          JSON.stringify(merged),
        );
      }

      if (data.userData) {
        localStorage.setItem(
          STORAGE_KEYS.USER_DATA,
          JSON.stringify(data.userData),
        );
      }

      if (data.subscription) {
        localStorage.setItem(
          STORAGE_KEYS.SUBSCRIPTION,
          JSON.stringify(data.subscription),
        );
      }

      if (data.theme) {
        localStorage.setItem(STORAGE_KEYS.THEME, data.theme);
      }

      return true;
    } catch (error) {
      console.error("Failed to import data:", error);
      return false;
    }
  },

  // Clear all data
  clearAll: (walletAddress?: string): void => {
    try {
      if (walletAddress) {
        // Clear only user's data
        localStorageService.clearConversations(walletAddress);
        localStorageService.clearSubscription();
      } else {
        // Clear all data
        Object.values(STORAGE_KEYS).forEach((key) => {
          localStorage.removeItem(key);
        });
      }
    } catch (error) {
      console.error("Failed to clear data:", error);
    }
  },

  // Storage analytics
  getStorageStats: (walletAddress?: string) => {
    try {
      const conversations = localStorageService.getConversations(walletAddress);
      const totalMessages = conversations.reduce(
        (acc, conv) => acc + conv.messages.length,
        0,
      );
      const exportedData = localStorageService.exportData(walletAddress);
      const storageUsed = new Blob([exportedData]).size;
      const maxStorageBytes = 5 * 1024 * 1024; // 5MB typical localStorage limit

      return {
        conversationCount: conversations.length,
        messageCount: totalMessages,
        storageUsedBytes: storageUsed,
        storageUsedKB: Math.round((storageUsed / 1024) * 100) / 100,
        storageUsedMB: Math.round((storageUsed / (1024 * 1024)) * 100) / 100,
        maxStorageBytes,
        maxStorageMB: 5,
        percentageUsed: Math.round((storageUsed / maxStorageBytes) * 100),
      };
    } catch (error) {
      console.error("Error calculating storage stats:", error);
      return {
        conversationCount: 0,
        messageCount: 0,
        storageUsedBytes: 0,
        storageUsedKB: 0,
        storageUsedMB: 0,
        maxStorageBytes: 5 * 1024 * 1024,
        maxStorageMB: 5,
        percentageUsed: 0,
      };
    }
  },
};
