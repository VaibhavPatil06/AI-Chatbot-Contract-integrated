# 🤖 AI Chat Pro - Decentralized AI Chatbot

A production-ready, blockchain-integrated AI chatbot application built with Next.js, featuring Web3 wallet connectivity, smart contract-based subscription management, and real-time AI responses.

## ✨ Key Features

### 💬 Core Chat Features

- Real-time AI conversations with streaming responses
- Unlimited free tier (no credit card required)
- Unlimited conversations and message history
- Beautiful code syntax highlighting
- Auto-saving with localStorage persistence
- Responsive mobile and desktop design

### 🔗 Blockchain Integration

- MetaMask wallet connection (ethers.js v6)
- Multi-network support (Ethereum, Sepolia, Polygon, Amoy)
- Smart contract-based subscription management
- Real transaction handling with gas estimation
- Three subscription tiers (Basic, Premium, Enterprise)

### 📊 User Dashboard

- Analytics dashboard with conversation stats
- Data export/import functionality
- Wallet management and settings
- Light/Dark theme toggle
- Network information display

## 🛠️ Technology Stack

| Category             | Technology                       |
| -------------------- | -------------------------------- |
| **Frontend**         | Next.js 13, React 18, TypeScript |
| **Styling**          | Tailwind CSS, Radix UI           |
| **State Management** | Redux Toolkit                    |
| **Web3**             | ethers.js v6, MetaMask           |
| **Charts**           | Recharts                         |
| **Real-time**        | Socket.io                        |
| **Smart Contracts**  | Solidity 0.8.19, OpenZeppelin    |
| **Deployment**       | Netlify / Vercel ready           |

## 📋 Requirements

- **Node.js** v16 or higher
- **npm** or **yarn**
- **MetaMask** extension (for Web3 features - optional)
- **Git**

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd project
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

### 4. Open in Browser

Navigate to **http://localhost:3000**

## 📖 How to Use

### Start a Conversation

1. Click **"New Conversation"** button
2. Type your message
3. Press **Enter** to send (Shift+Enter for new line)
4. Watch the AI respond in real-time

### Manage Conversations

- **Switch**: Click any conversation in sidebar
- **Rename**: Hover and click edit icon
- **Delete**: Hover and click delete icon
- Auto-saved in browser

### Connect Wallet (Optional)

1. Click **"Connect Wallet"** button
2. Approve MetaMask connection
3. View wallet address and balance
4. Explore subscription plans

### Navigation

- **Chat** - Main conversation interface
- **📊 Stats** - View analytics and stats
- **⚙️ Settings** - Wallet & data management
- **💳 Subscription** - Plan management (with wallet)

## 🎮 Keyboard Shortcuts

| Key             | Action       |
| --------------- | ------------ |
| `Enter`         | Send message |
| `Shift + Enter` | New line     |

## 📁 Project Structure

```
project/
├── app/                          # Next.js app directory
│   ├── api/                      # API routes
│   │   ├── chat/route.ts        # Chat endpoint (streaming)
│   │   ├── socket/route.ts      # WebSocket endpoint
│   │   └── subscription/        # Subscription API
│   ├── page.tsx                 # Home page
│   ├── layout.tsx               # Root layout
│   ├── settings/page.tsx        # Settings page
│   ├── stats/page.tsx           # Analytics dashboard
│   └── subscription/page.tsx    # Subscription management
│
├── components/                  # React components
│   ├── chat/                    # Chat components
│   ├── layout/                  # Layout (Header, Sidebar)
│   ├── providers/               # Redux provider
│   └── ui/                      # Radix UI components
│
├── lib/                         # Core utilities
│   ├── redux/                   # Redux store & slices
│   ├── services/                # Business logic
│   └── utils/                   # Helper functions
│
├── contracts/                   # Smart contracts
│   └── SubscriptionManager.sol  # Subscription contract
│
├── types/                       # TypeScript types
├── hooks/                       # Custom React hooks
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
├── next.config.js               # Next.js config
└── README.md                    # This file
```

## 🔌 API Endpoints

### POST /api/chat

Send a message and get AI response

**Request:**

```json
{
  "conversationId": "unique-id",
  "message": "Your message",
  "walletAddress": "0x... or anonymous"
}
```

**Response:** Server-Sent Events stream

```json
{
  "type": "chunk",
  "messageId": "msg-id",
  "content": "Response text",
  "isComplete": false
}
```

### GET /api/chat

Retrieve conversations

**Query Parameters:**

- `wallet` (required) - Wallet address
- `conversationId` (optional) - Specific conversation

### DELETE /api/chat

Delete a conversation

**Request:**

```json
{
  "conversationId": "id",
  "walletAddress": "0x..."
}
```

## 🧪 Test the API

### Using cURL

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "test-123",
    "message": "Hello!",
    "walletAddress": "anonymous"
  }'
```

### Using JavaScript

```javascript
const response = await fetch("/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    conversationId: "test-123",
    message: "Hello!",
    walletAddress: "anonymous",
  }),
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const text = decoder.decode(value);
  console.log(text);
}
```

## 📦 Available Commands

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Check TypeScript types
```

## 🚢 Deployment

### Netlify

1. Connect GitHub repo to Netlify
2. Netlify auto-detects Next.js
3. Deploy automatically

### Vercel

1. Import project from GitHub
2. Click Deploy
3. Done!

### Manual

```bash
npm run build
npm start
```

## 🐛 Troubleshooting

### Chat endpoint returns no response

- Check if dev server is running (`npm run dev`)
- Verify request format in browser console
- Check Network tab in DevTools
- Ensure correct conversationId

### MetaMask connection fails

- Install MetaMask extension
- Disable private browsing mode
- Try disconnecting and reconnecting
- Check supported networks

### Conversations not saving

- Enable localStorage in browser
- Clear cache and reload
- Check DevTools → Application → Storage
- Disable private browsing

### Slow responses

- Normal - responses stream gradually
- Check internet connection
- Verify Network tab in DevTools

## 🔐 Security

### Frontend

✅ MetaMask provider validation
✅ Contract address verification
✅ Gas estimation before transactions
✅ Input validation

### Smart Contract

✅ Access control modifiers
✅ Reentrancy protection
✅ Pausable emergency controls
✅ Query quota enforcement

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [ethers.js Docs](https://docs.ethers.org/)
- [Redux Toolkit Docs](https://redux-toolkit.js.org/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Solidity Docs](https://docs.soliditylang.org/)

## 🎯 Features Implemented

✅ Real-time AI chat with streaming
✅ Wallet connectivity (MetaMask)
✅ Smart contract integration
✅ Subscription management
✅ Analytics dashboard
✅ Data export/import
✅ Responsive design
✅ Theme toggle
✅ Conversation management
✅ Code syntax highlighting

## 📝 License

Private and Proprietary - All Rights Reserved

## 🤝 Support

- Check USER_GUIDE.txt for detailed instructions
- Review IMPLEMENTATION_COMPLETE.txt
- Check GitHub issues
- Create new issue with details

---

**Built with ❤️ using Next.js, React, and Web3**
