export interface TypingIndicator {
  userId: string;
  conversationId: string;
  isTyping: boolean;
}

export interface OnlineUser {
  userId: string;
  lastSeen: Date;
}

export interface SocketMessage {
  type: 'message' | 'typing' | 'stop-typing' | 'user-joined' | 'user-left';
  payload: any;
}

export interface StreamingResponse {
  id: string;
  content: string;
  isComplete: boolean;
  error?: string;
}