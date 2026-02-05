import { NextRequest, NextResponse } from "next/server";
import { openAIService } from "@/lib/services/openai";

// In-memory storage for server-side simulation
let conversations: Map<string, any> = new Map();

/**
 * POST /api/chat
 * Send a chat message and get AI response
 * Body: { conversationId, message, walletAddress }
 */
export async function POST(req: NextRequest) {
  try {
    const { conversationId, message, walletAddress } = await req.json();

    // Validation
    if (!conversationId || !message) {
      return NextResponse.json(
        {
          error: "Missing required fields: conversationId, message",
        },
        { status: 400 },
      );
    }

    // Free tier - no subscription required
    const userAddr = (walletAddress || "anonymous").toLowerCase();
    const conversationKey = `${userAddr}_${conversationId}`;

    // Find or create conversation
    let conversation = conversations.get(conversationKey);
    if (!conversation) {
      conversation = {
        id: conversationId,
        title: await openAIService.generateTitle([
          { role: "user", content: message },
        ]),
        messages: [],
        walletAddress: userAddr,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      conversations.set(conversationKey, conversation);
    }

    // Add user message
    const userMessage = {
      id: Math.random().toString(36).substr(2, 9),
      role: "user" as const,
      content: message,
      timestamp: new Date(),
    };
    conversation.messages.push(userMessage);
    conversation.updatedAt = new Date();

    // Generate AI response
    const assistantMessageId = Math.random().toString(36).substr(2, 9);
    const assistantMessage = {
      id: assistantMessageId,
      role: "assistant" as const,
      content: "",
      timestamp: new Date(),
      isStreaming: true,
    };
    conversation.messages.push(assistantMessage);

    // Create streaming response
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          let fullContent = "";

          const responseGenerator = openAIService.generateResponse(
            conversation.messages,
          );

          for await (const chunk of responseGenerator) {
            fullContent += chunk;

            const data = {
              type: "chunk",
              messageId: assistantMessageId,
              content: fullContent,
              isComplete: false,
              queriesRemaining: subscription.queriesRemaining,
            };

            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(data)}\n\n`),
            );
          }

          // Send completion
          assistantMessage.content = fullContent;
          assistantMessage.isStreaming = false;
          conversation.updatedAt = new Date();

          const completionData = {
            type: "complete",
            messageId: assistantMessageId,
            content: fullContent,
            isComplete: true,
            queriesRemaining: subscription.queriesRemaining,
            conversationId: conversationId,
          };

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(completionData)}\n\n`),
          );
          controller.close();
        } catch (error: any) {
          console.error("Chat response generation error:", error);
          const errorData = {
            type: "error",
            error: error.message || "Failed to generate response",
          };
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`),
          );
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process message" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/chat
 * Load user conversations
 * Query params: ?wallet=<wallet_address>&conversationId=<id>
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const walletAddress = searchParams.get("wallet");
    const conversationId = searchParams.get("conversationId");

    if (!walletAddress) {
      return NextResponse.json({ conversations: [] });
    }

    const normalizedAddress = walletAddress.toLowerCase();

    // Return single conversation if ID provided
    if (conversationId) {
      const conversationKey = `${normalizedAddress}_${conversationId}`;
      const conversation = conversations.get(conversationKey);

      if (!conversation) {
        return NextResponse.json(
          { error: "Conversation not found" },
          { status: 404 },
        );
      }

      return NextResponse.json({ conversation });
    }

    // Return all conversations for wallet
    const userConversations: any[] = [];
    conversations.forEach((conv, key) => {
      if (key.startsWith(normalizedAddress)) {
        userConversations.push(conv);
      }
    });

    // Sort by updatedAt descending
    userConversations.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );

    return NextResponse.json({ conversations: userConversations });
  } catch (error: any) {
    console.error("Failed to load conversations:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load conversations" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/chat
 * Delete a conversation
 * Body: { conversationId, walletAddress }
 */
export async function DELETE(req: NextRequest) {
  try {
    const { conversationId, walletAddress } = await req.json();

    if (!conversationId || !walletAddress) {
      return NextResponse.json(
        { error: "Missing required fields: conversationId, walletAddress" },
        { status: 400 },
      );
    }

    const normalizedAddress = walletAddress.toLowerCase();
    const conversationKey = `${normalizedAddress}_${conversationId}`;

    const conversation = conversations.get(conversationKey);
    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 },
      );
    }

    conversations.delete(conversationKey);

    return NextResponse.json({
      success: true,
      message: "Conversation deleted",
    });
  } catch (error: any) {
    console.error("Failed to delete conversation:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete conversation" },
      { status: 500 },
    );
  }
}
