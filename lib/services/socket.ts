let socket: any = null;

export const socketService = {
  connect: () => {
    if (typeof window === 'undefined') return null;
    
    // Simulate socket connection since we can't use actual Socket.io in this environment
    const mockSocket = {
      connected: true,
      id: Math.random().toString(36).substr(2, 9),
      
      emit: (event: string, data?: any) => {
        console.log(`[Socket] Emit: ${event}`, data);
      },
      
      on: (event: string, callback: Function) => {
        console.log(`[Socket] Listening to: ${event}`);
        // Simulate some events
        if (event === 'connect') {
          setTimeout(() => callback(), 100);
        }
      },
      
      off: (event: string, callback?: Function) => {
        console.log(`[Socket] Stop listening to: ${event}`);
      },
      
      disconnect: () => {
        console.log('[Socket] Disconnected');
        mockSocket.connected = false;
      },
    };
    
    socket = mockSocket;
    return socket;
  },

  getSocket: () => socket,

  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  // Simulated real-time events
  emitMessage: (conversationId: string, message: any) => {
    if (socket) {
      socket.emit('send-message', { conversationId, message });
    }
  },

  emitTyping: (conversationId: string, isTyping: boolean) => {
    if (socket) {
      socket.emit('typing', { conversationId, isTyping });
    }
  },

  joinConversation: (conversationId: string) => {
    if (socket) {
      socket.emit('join-conversation', { conversationId });
    }
  },

  leaveConversation: (conversationId: string) => {
    if (socket) {
      socket.emit('leave-conversation', { conversationId });
    }
  },
};