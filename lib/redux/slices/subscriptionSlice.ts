import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { SubscriptionPlan } from "@/types";

interface Subscription {
  walletAddress: string;
  planId: string;
  planName: "basic" | "premium" | "enterprise";
  billingCycle: "monthly" | "yearly";
  price: number;
  queriesRemaining: number;
  queriesUsed: number;
  queryLimit: number;
  startDate: Date | string;
  expiryDate: Date | string;
  transactionHash: string;
  status: "active" | "expired" | "cancelled" | "pending";
  autoRenew: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface SubscriptionState {
  currentPlan: SubscriptionPlan | null;
  currentSubscription: Subscription | null;
  availablePlans: SubscriptionPlan[];
  queriesRemaining: number;
  subscriptionExpiry: Date | null;
  subscriptionStatus: "active" | "expired" | "cancelled" | "none";
  billingCycle: "monthly" | "yearly";
  paymentFlow: {
    isProcessing: boolean;
    selectedPlan: SubscriptionPlan | null;
    transactionHash: string | null;
    error: string | null;
  };
  loading: boolean;
  error: string | null;
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

const initialState: SubscriptionState = {
  currentPlan: null,
  currentSubscription: null,
  availablePlans: defaultPlans,
  queriesRemaining: 0,
  subscriptionExpiry: null,
  subscriptionStatus: "none",
  billingCycle: "monthly",
  paymentFlow: {
    isProcessing: false,
    selectedPlan: null,
    transactionHash: null,
    error: null,
  },
  loading: false,
  error: null,
};

export const subscribeToPlan = createAsyncThunk(
  "subscription/subscribe",
  async ({
    planId,
    billingCycle,
    walletAddress,
  }: {
    planId: string;
    billingCycle: "monthly" | "yearly";
    walletAddress: string;
  }) => {
    const response = await fetch("/api/subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress, planId, billingCycle }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to process subscription");
    }

    return response.json();
  },
);

export const loadSubscription = createAsyncThunk(
  "subscription/load",
  async (walletAddress: string) => {
    const response = await fetch(
      `/api/subscription?wallet=${walletAddress}&action=status`,
    );

    if (!response.ok) {
      throw new Error("Failed to load subscription");
    }

    return response.json();
  },
);

export const loadPlans = createAsyncThunk(
  "subscription/loadPlans",
  async () => {
    const response = await fetch(`/api/subscription?action=plans`);

    if (!response.ok) {
      throw new Error("Failed to load plans");
    }

    return response.json();
  },
);

export const updateSubscription = createAsyncThunk(
  "subscription/update",
  async ({
    walletAddress,
    action,
    newPlanId,
  }: {
    walletAddress: string;
    action: "cancel" | "toggle-autorenew" | "upgrade";
    newPlanId?: string;
  }) => {
    const response = await fetch("/api/subscription", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress, action, newPlanId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update subscription");
    }

    return response.json();
  },
);

const subscriptionSlice = createSlice({
  name: "subscription",
  initialState,
  reducers: {
    setBillingCycle: (state, action: PayloadAction<"monthly" | "yearly">) => {
      state.billingCycle = action.payload;
    },
    selectPlan: (state, action: PayloadAction<SubscriptionPlan>) => {
      state.paymentFlow.selectedPlan = action.payload;
      state.paymentFlow.error = null;
    },
    startPaymentFlow: (state) => {
      state.paymentFlow.isProcessing = true;
      state.paymentFlow.error = null;
    },
    cancelPaymentFlow: (state) => {
      state.paymentFlow.isProcessing = false;
      state.paymentFlow.selectedPlan = null;
      state.paymentFlow.transactionHash = null;
      state.paymentFlow.error = null;
    },
    decrementQueries: (state) => {
      if (state.queriesRemaining > 0 || state.queriesRemaining === -1) {
        if (state.queriesRemaining !== -1) {
          state.queriesRemaining -= 1;
        }
      }
    },
    clearError: (state) => {
      state.error = null;
      state.paymentFlow.error = null;
    },
    resetSubscription: (state) => {
      state.currentPlan = null;
      state.currentSubscription = null;
      state.queriesRemaining = 0;
      state.subscriptionExpiry = null;
      state.subscriptionStatus = "none";
      state.paymentFlow = {
        isProcessing: false,
        selectedPlan: null,
        transactionHash: null,
        error: null,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Load Plans
      .addCase(loadPlans.fulfilled, (state, action) => {
        state.availablePlans = action.payload.plans;
      })

      // Subscribe to Plan
      .addCase(subscribeToPlan.pending, (state) => {
        state.paymentFlow.isProcessing = true;
        state.paymentFlow.error = null;
      })
      .addCase(subscribeToPlan.fulfilled, (state, action) => {
        state.paymentFlow.isProcessing = false;
        state.currentSubscription = action.payload.subscription;
        state.currentPlan =
          state.availablePlans.find(
            (p) => p.id === action.payload.subscription.planId,
          ) || null;
        state.queriesRemaining = action.payload.subscription.queriesRemaining;
        state.subscriptionExpiry = new Date(
          action.payload.subscription.expiryDate,
        );
        state.subscriptionStatus = "active" as const;
        state.paymentFlow.transactionHash =
          action.payload.subscription.transactionHash;
        state.paymentFlow.selectedPlan = null;
      })
      .addCase(subscribeToPlan.rejected, (state, action) => {
        state.paymentFlow.isProcessing = false;
        state.paymentFlow.error = action.error.message || "Failed to subscribe";
        state.error = action.error.message || "Failed to subscribe";
      })

      // Load Subscription
      .addCase(loadSubscription.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadSubscription.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.subscription) {
          state.currentSubscription = action.payload.subscription;
          state.currentPlan =
            state.availablePlans.find(
              (p) => p.id === action.payload.subscription.planId,
            ) || null;
          state.queriesRemaining = action.payload.subscription.queriesRemaining;
          state.subscriptionExpiry = new Date(
            action.payload.subscription.expiryDate,
          );
          state.subscriptionStatus = action.payload.subscription.status;
        } else {
          state.currentPlan = null;
          state.currentSubscription = null;
          state.queriesRemaining = 0;
          state.subscriptionExpiry = null;
          state.subscriptionStatus = "none";
        }
      })
      .addCase(loadSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to load subscription";
        state.subscriptionStatus = "none";
      })

      // Update Subscription
      .addCase(updateSubscription.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSubscription = action.payload.subscription;
        state.subscriptionStatus = action.payload.subscription.status;
        if (action.payload.subscription.status === "active") {
          state.queriesRemaining = action.payload.subscription.queriesRemaining;
        }
      })
      .addCase(updateSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to update subscription";
      });
  },
});

export const {
  setBillingCycle,
  selectPlan,
  startPaymentFlow,
  cancelPaymentFlow,
  decrementQueries,
  clearError,
  resetSubscription,
} = subscriptionSlice.actions;

export default subscriptionSlice.reducer;
