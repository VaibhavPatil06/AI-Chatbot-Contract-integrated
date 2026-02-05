"use client";

import { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks";
import {
  subscribeToPlan,
  loadSubscription,
  updateSubscription,
} from "@/lib/redux/slices/subscriptionSlice";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { contractService, PLAN_PRICES } from "@/lib/services/contract";
import { ethers } from "ethers";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { ChevronRight, Check, Zap } from "lucide-react";

export default function SubscriptionPage() {
  const dispatch = useAppDispatch();
  const { connected, address } = useAppSelector((state) => state.wallet);
  const { currentPlan, availablePlans, billingCycle, loading, error } =
    useAppSelector((state) => state.subscription);
  const [billingType, setBillingType] = useState<"monthly" | "yearly">(
    "monthly",
  );
  const [selectedPlan, setSelectedPlan] = useState<
    "basic" | "premium" | "enterprise"
  >("premium");
  const [isProcessing, setIsProcessing] = useState(false);
  const [contractAddress, setContractAddress] = useState("0x0");
  const [txHash, setTxHash] = useState<string | null>(null);

  useEffect(() => {
    if (connected && address) {
      dispatch(loadSubscription(address));
    }
  }, [connected, address, dispatch]);

  const handleSubscribe = async () => {
    if (!connected || !address) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      setIsProcessing(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Call smart contract
      const result = await contractService.subscribe(
        contractAddress,
        signer,
        selectedPlan,
        billingType === "yearly",
      );

      setTxHash(result.transactionHash);

      // Update Redux
      await dispatch(
        subscribeToPlan({
          planId: selectedPlan,
          billingCycle: billingType,
          walletAddress: address,
        }),
      );

      alert("Subscription successful!");
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!connected || !address) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      setIsProcessing(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Cancel subscription on contract
      await contractService.cancelSubscription(
        contractAddress,
        signer,
        address,
      );

      // Update Redux
      await dispatch(
        updateSubscription({
          walletAddress: address,
          action: "cancel",
        }),
      );

      alert("Subscription cancelled successfully");
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const plans = [
    {
      id: "basic" as const,
      name: "Basic",
      description: "Perfect for beginners",
      monthlyPrice: "0.01 ETH",
      yearlyPrice: "0.1 ETH",
      features: [
        "100 queries/month",
        "Standard AI responses",
        "Chat history",
        "Email support",
      ],
      queryLimit: 100,
    },
    {
      id: "premium" as const,
      name: "Premium",
      description: "Best for professionals",
      monthlyPrice: "0.05 ETH",
      yearlyPrice: "0.5 ETH",
      features: [
        "1,000 queries/month",
        "Advanced AI responses",
        "Priority support",
        "Code export",
        "API access",
      ],
      queryLimit: 1000,
      popular: true,
    },
    {
      id: "enterprise" as const,
      name: "Enterprise",
      description: "For maximum power",
      monthlyPrice: "0.2 ETH",
      yearlyPrice: "2.0 ETH",
      features: [
        "Unlimited queries",
        "Premium AI responses",
        "24/7 support",
        "Custom integrations",
        "Dedicated account manager",
      ],
      queryLimit: -1,
    },
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Billing Toggle */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Subscription Plans
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Choose the perfect plan for your needs
              </p>

              <div className="flex items-center gap-4 mb-8">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Monthly
                </span>
                <button
                  onClick={() =>
                    setBillingType(
                      billingType === "monthly" ? "yearly" : "monthly",
                    )
                  }
                  className="relative inline-flex h-8 w-14 items-center rounded-full bg-gray-300 dark:bg-gray-700"
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${
                      billingType === "yearly"
                        ? "translate-x-7"
                        : "translate-x-1"
                    }`}
                  />
                </button>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Yearly
                  <span className="ml-2 inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                    Save 20%
                  </span>
                </span>
              </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`relative transition-all ${
                    plan.popular
                      ? "ring-2 ring-purple-500 md:scale-105"
                      : "hover:shadow-lg"
                  } cursor-pointer ${selectedPlan === plan.id ? "ring-2 ring-blue-500" : ""}`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.popular && (
                    <Badge className="absolute top-4 right-4 bg-purple-500">
                      Popular
                    </Badge>
                  )}
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      {plan.name}
                    </CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6">
                      <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        {billingType === "monthly"
                          ? plan.monthlyPrice
                          : plan.yearlyPrice}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        per {billingType === "monthly" ? "month" : "year"}
                      </p>
                    </div>

                    <div className="mb-6 space-y-3">
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={handleSubscribe}
                      disabled={isProcessing || !connected}
                      className="w-full"
                      variant={selectedPlan === plan.id ? "default" : "outline"}
                    >
                      {isProcessing ? "Processing..." : "Subscribe Now"}
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Current Subscription Info */}
            {currentPlan && (
              <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <CardTitle>Your Current Subscription</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Plan
                      </p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {currentPlan.displayName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Status
                      </p>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Next Billing
                      </p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        30 days
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Auto-Renew
                      </p>
                      <Badge>Enabled</Badge>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" disabled={isProcessing}>
                          Cancel Subscription
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Cancel Subscription?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            You will lose access to premium features at the end
                            of your current billing period.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCancel}>
                          Cancel Subscription
                        </AlertDialogAction>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Error Display */}
            {error && (
              <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                <CardHeader>
                  <CardTitle className="text-red-700 dark:text-red-400">
                    Error
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-red-700 dark:text-red-300">{error}</p>
                </CardContent>
              </Card>
            )}

            {/* Transaction Hash Display */}
            {txHash && (
              <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="text-green-700 dark:text-green-400">
                    Transaction Successful
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 break-all">
                    Hash: {txHash}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
