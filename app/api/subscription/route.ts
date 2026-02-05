import { NextRequest, NextResponse } from "next/server";

// In-memory storage for subscriptions (simulated database)
let subscriptions: Map<string, any> = new Map();

interface SubscriptionPlan {
  id: string;
  name: "basic" | "premium" | "enterprise";
  displayName: string;
  price: { monthly: number; yearly: number };
  features: string[];
  queryLimit: number;
  popular?: boolean;
}

const defaultPlans: SubscriptionPlan[] = [
  {
    id: "basic",
    name: "basic",
    displayName: "Basic",
    price: { monthly: 0.01, yearly: 0.1 },
    features: ["100 queries/month", "Standard AI model", "Chat history"],
    queryLimit: 100,
  },
  {
    id: "premium",
    name: "premium",
    displayName: "Premium",
    price: { monthly: 0.05, yearly: 0.5 },
    features: [
      "1,000 queries/month",
      "Advanced AI model",
      "Priority support",
      "Code export",
    ],
    queryLimit: 1000,
    popular: true,
  },
  {
    id: "enterprise",
    name: "enterprise",
    displayName: "Enterprise",
    price: { monthly: 0.2, yearly: 2.0 },
    features: [
      "Unlimited queries",
      "Premium AI model",
      "24/7 support",
      "Custom integrations",
    ],
    queryLimit: -1,
  },
];

/**
 * GET /api/subscription
 * Retrieve subscription plans and user subscription status
 * Query params: ?wallet=<wallet_address>&action=<plans|status>
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const walletAddress = searchParams.get("wallet");
    const action = searchParams.get("action") || "status";

    // Return all available plans
    if (action === "plans") {
      return NextResponse.json({
        plans: defaultPlans,
        success: true,
      });
    }

    // Return user subscription status
    if (!walletAddress) {
      return NextResponse.json({
        subscription: null,
        plans: defaultPlans,
        requiresSubscription: true,
      });
    }

    const normalizedAddress = walletAddress.toLowerCase();
    const subscription = subscriptions.get(normalizedAddress);

    // Check if subscription is still valid
    if (subscription) {
      const isExpired = new Date(subscription.expiryDate) < new Date();
      if (isExpired && !subscription.autoRenew) {
        subscription.status = "expired";
      }
    }

    // Return user subscription or null if not subscribed
    return NextResponse.json({
      subscription: subscription || null,
      plans: defaultPlans,
      requiresSubscription: !subscription || subscription.status !== "active",
      success: true,
    });
  } catch (error) {
    console.error("Failed to load subscription:", error);
    return NextResponse.json(
      { error: "Failed to load subscription", success: false },
      { status: 500 },
    );
  }
}

/**
 * POST /api/subscription
 * Create or update subscription
 * Body: { walletAddress, planId, billingCycle }
 */
export async function POST(req: NextRequest) {
  try {
    const { walletAddress, planId, billingCycle } = await req.json();

    // Validation
    if (!walletAddress || !planId || !billingCycle) {
      return NextResponse.json(
        {
          error: "Missing required fields: walletAddress, planId, billingCycle",
          success: false,
        },
        { status: 400 },
      );
    }

    if (!["monthly", "yearly"].includes(billingCycle)) {
      return NextResponse.json(
        {
          error: 'Invalid billing cycle. Use "monthly" or "yearly"',
          success: false,
        },
        { status: 400 },
      );
    }

    const plan = defaultPlans.find((p) => p.id === planId);
    if (!plan) {
      return NextResponse.json(
        {
          error: `Invalid plan. Available plans: ${defaultPlans.map((p) => p.id).join(", ")}`,
          success: false,
        },
        { status: 400 },
      );
    }

    // Simulate blockchain transaction processing
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const normalizedAddress = walletAddress.toLowerCase();
    const now = new Date();
    const durationMs =
      (billingCycle === "yearly" ? 365 : 30) * 24 * 60 * 60 * 1000;
    const expiryDate = new Date(now.getTime() + durationMs);
    const transactionHash = "0x" + Math.random().toString(16).substr(2, 64);

    const subscription = {
      walletAddress: normalizedAddress,
      planId: plan.id,
      planName: plan.name,
      billingCycle,
      price: plan.price[billingCycle as keyof typeof plan.price],
      queriesRemaining: plan.queryLimit,
      queriesUsed: 0,
      queryLimit: plan.queryLimit,
      startDate: now,
      expiryDate,
      transactionHash,
      status: "active" as const,
      autoRenew: true,
      createdAt: now,
      updatedAt: now,
    };

    // Store subscription
    subscriptions.set(normalizedAddress, subscription);

    return NextResponse.json({
      subscription,
      success: true,
      message: `Successfully subscribed to ${plan.displayName} plan`,
    });
  } catch (error) {
    console.error("Failed to process subscription:", error);
    return NextResponse.json(
      { error: "Failed to process subscription", success: false },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/subscription
 * Update subscription (e.g., cancel, upgrade, toggle auto-renewal)
 * Body: { walletAddress, action, newPlanId? }
 */
export async function PUT(req: NextRequest) {
  try {
    const { walletAddress, action, newPlanId } = await req.json();

    if (!walletAddress || !action) {
      return NextResponse.json(
        {
          error: "Missing required fields: walletAddress, action",
          success: false,
        },
        { status: 400 },
      );
    }

    const normalizedAddress = walletAddress.toLowerCase();
    const subscription = subscriptions.get(normalizedAddress);

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found", success: false },
        { status: 404 },
      );
    }

    switch (action) {
      case "cancel":
        subscription.status = "cancelled";
        subscription.updatedAt = new Date();
        break;

      case "toggle-autorenew":
        subscription.autoRenew = !subscription.autoRenew;
        subscription.updatedAt = new Date();
        break;

      case "upgrade":
        if (!newPlanId) {
          return NextResponse.json(
            { error: "newPlanId required for upgrade action", success: false },
            { status: 400 },
          );
        }
        const newPlan = defaultPlans.find((p) => p.id === newPlanId);
        if (!newPlan) {
          return NextResponse.json(
            { error: "Invalid plan", success: false },
            { status: 400 },
          );
        }
        subscription.planId = newPlan.id;
        subscription.planName = newPlan.name;
        subscription.queryLimit = newPlan.queryLimit;
        subscription.queriesRemaining = newPlan.queryLimit;
        subscription.updatedAt = new Date();
        break;

      default:
        return NextResponse.json(
          {
            error: `Unknown action: ${action}. Available: cancel, toggle-autorenew, upgrade`,
            success: false,
          },
          { status: 400 },
        );
    }

    subscriptions.set(normalizedAddress, subscription);
    return NextResponse.json({
      subscription,
      success: true,
      message: `Subscription ${action} completed`,
    });
  } catch (error) {
    console.error("Failed to update subscription:", error);
    return NextResponse.json(
      { error: "Failed to update subscription", success: false },
      { status: 500 },
    );
  }
}
