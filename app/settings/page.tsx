"use client";

import { useState } from "react";
import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks";
import { localStorageService } from "@/lib/services/localStorage";
import { resetSubscription } from "@/lib/redux/slices/subscriptionSlice";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import {
  Copy,
  Download,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
} from "lucide-react";

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const { address, networkInfo, balance } = useAppSelector(
    (state) => state.wallet,
  );
  const { currentPlan } = useAppSelector((state) => state.subscription);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [exportedData, setExportedData] = useState<string | null>(null);

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExportData = () => {
    if (address) {
      const data = localStorageService.exportData(address);
      setExportedData(data);

      // Trigger download
      const element = document.createElement("a");
      element.setAttribute(
        "href",
        `data:text/plain;charset=utf-8,${encodeURIComponent(data)}`,
      );
      element.setAttribute("download", `ai-chat-export-${Date.now()}.json`);
      element.style.display = "none";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  const handleImportData = () => {
    if (!address) {
      alert("Please connect your wallet first");
      return;
    }

    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const text = await file.text();
        const success = localStorageService.importData(text);
        if (success) {
          alert("Data imported successfully!");
          window.location.reload();
        } else {
          alert("Failed to import data. Please check the file format.");
        }
      }
    };
    input.click();
  };

  const handleClearAllData = () => {
    if (address) {
      localStorageService.clearAll(address);
      dispatch(resetSubscription());
      alert("All data has been cleared");
      window.location.reload();
    }
  };

  const stats = address ? localStorageService.getStorageStats(address) : null;

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
              Settings
            </h1>

            {/* Account Section */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Wallet & Account</CardTitle>
                <CardDescription>
                  Manage your blockchain wallet connection
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Wallet Address */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                    Wallet Address
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={address || "Not connected"}
                      readOnly
                      className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-md font-mono text-sm border border-gray-300 dark:border-gray-700"
                    />
                    {address && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCopyAddress}
                        >
                          <Copy className="w-4 h-4" />
                          {copied ? "Copied" : "Copy"}
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={`${networkInfo?.explorer}/address/${address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Network Info */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                    Connected Network
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {networkInfo?.name || "Unknown Network"}
                      </span>
                      <span className="text-xs text-gray-500">
                        (Chain ID: {networkInfo?.chainId})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Balance */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                    Wallet Balance
                  </label>
                  <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
                    <span className="text-lg font-bold text-blue-900 dark:text-blue-400">
                      {balance.toFixed(4)} {networkInfo?.symbol || "ETH"}
                    </span>
                  </div>
                </div>

                {/* Subscription Status */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                    Current Subscription
                  </label>
                  <div className="px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800 flex items-center justify-between">
                    <span className="text-lg font-bold text-green-900 dark:text-green-400">
                      {currentPlan?.displayName || "No Active Subscription"}
                    </span>
                    {currentPlan && (
                      <Badge className="bg-green-600">Active</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Management Section */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>
                  Manage your conversations and personal data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Storage Stats */}
                {stats && (
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Conversations
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {stats.conversationCount}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Messages
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {stats.messageCount}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Storage Used
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {stats.storageUsedMB.toFixed(2)}MB / 5.00MB (
                        {stats.percentageUsed}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2 mt-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full transition-all"
                        style={{ width: `${stats.percentageUsed}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Export Button */}
                <Button
                  onClick={handleExportData}
                  variant="outline"
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export All Data
                </Button>

                {/* Import Button */}
                <Button
                  onClick={handleImportData}
                  variant="outline"
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import Data
                </Button>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10">
              <CardHeader>
                <CardTitle className="text-red-700 dark:text-red-400">
                  Danger Zone
                </CardTitle>
                <CardDescription className="text-red-600 dark:text-red-500">
                  Irreversible actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear All Data
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear All Data?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will delete all your conversations, messages, and
                        settings. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClearAllData}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Clear All Data
                    </AlertDialogAction>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>

            {/* App Info */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Application Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    App Version
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    1.0.0
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Last Updated
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    February 4, 2026
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Framework
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    Next.js 14 + React 18
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Blockchain
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    Ethereum / Polygon
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

// Import Upload icon from lucide-react (missing in the original)
import { Upload } from "lucide-react";
