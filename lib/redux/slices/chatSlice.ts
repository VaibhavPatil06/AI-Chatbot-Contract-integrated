import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ChatMessage, Conversation } from '@/types';

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  currentMessage: string;
  isStreaming: boolean;
  streamingMessageId: string | null;
  onlineUsers: string[];
  typingUsers: { [conversationId: string]: string[] };
  loading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  conversations: [],
  activeConversationId: null,
  currentMessage: '',
  isStreaming: false,
  streamingMessageId: null,
  onlineUsers: [],
  typingUsers: {},
  loading: false,
  error: null,
};

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ conversationId, message }: { conversationId: string; message: string }) => {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId, message }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to send message');
    }
    
    return response.json();
  }
);

export const loadConversations = createAsyncThunk(
  'chat/loadConversations',
  async (walletAddress: string) => {
    const response = await fetch(`/api/chat/conversations?wallet=${walletAddress}`);
    
    if (!response.ok) {
      throw new Error('Failed to load conversations');
    }
    
    return response.json();
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveConversation: (state, action: PayloadAction<string>) => {
      state.activeConversationId = action.payload;
    },
    setCurrentMessage: (state, action: PayloadAction<string>) => {
      state.currentMessage = action.payload;
    },
    addMessage: (state, action: PayloadAction<{ conversationId: string; message: ChatMessage }>) => {
      const conversation = state.conversations.find(c => c.id === action.payload.conversationId);
      if (conversation) {
        conversation.messages.push(action.payload.message);
        conversation.updatedAt = new Date();
      }
    },
    updateStreamingMessage: (state, action: PayloadAction<{ messageId: string; content: string; isComplete?: boolean }>) => {
      const { messageId, content, isComplete } = action.payload;
      
      for (const conversation of state.conversations) {
        const message = conversation.messages.find(m => m.id === messageId);
        if (message) {
          message.content = content;
          if (isComplete) {
            message.isStreaming = false;
            state.isStreaming = false;
            state.streamingMessageId = null;
          }
          break;
        }
      }
    },
    startStreaming: (state, action: PayloadAction<string>) => {
      state.isStreaming = true;
      state.streamingMessageId = action.payload;
    },
    createConversation: (state, action: PayloadAction<Conversation>) => {
      state.conversations.unshift(action.payload);
      state.activeConversationId = action.payload.id;
    },
    setOnlineUsers: (state, action: PayloadAction<string[]>) => {
      state.onlineUsers = action.payload;
    },
    setTypingUsers: (state, action: PayloadAction<{ conversationId: string; users: string[] }>) => {
      state.typingUsers[action.payload.conversationId] = action.payload.users;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMessage = '';
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to send message';
      })
      .addCase(loadConversations.fulfilled, (state, action) => {
        state.conversations = action.payload;
      });
  },
});

export const {
  setActiveConversation,
  setCurrentMessage,
  addMessage,
  updateStreamingMessage,
  startStreaming,
  createConversation,
  setOnlineUsers,
  setTypingUsers,
  clearError,
} = chatSlice.actions;

export default chatSlice.reducer;