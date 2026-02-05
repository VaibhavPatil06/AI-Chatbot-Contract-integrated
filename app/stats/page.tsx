"use client";

import { useEffect, useState } from "react";
import { useAppSelector } from "@/lib/redux/hooks";
import { localStorageService } from "@/lib/services/localStorage";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  MessageSquare,
  MessageCircle,
  TrendingUp,
  HardDrive,
  Clock,
  Zap,
} from "lucide-react";

export default function StatsPage() {
  const { address } = useAppSelector((state) => state.wallet);
  const { queriesRemaining, currentPlan } = useAppSelector(
    (state) => state.subscription,
  );
  const [stats, setStats] = useState({
    conversationCount: 0,
    messageCount: 0,
    storageUsedKB: 0,
    storageUsedMB: 0,
    percentageUsed: 0,
    chartData: [] as any[],
  });

  useEffect(() => {
    if (address) {
      const storageStats = localStorageService.getStorageStats(address);
      const conversations = localStorageService.getConversations(address);

      // Prepare chart data
      const chartData = conversations.map((conv, idx) => ({
        name: conv.title.substring(0, 15),
        messages: conv.messages.length,
        index: idx + 1,
      }));

      setStats({
        conversationCount: storageStats.conversationCount,
        messageCount: storageStats.messageCount,
        storageUsedKB: storageStats.storageUsedKB,
        storageUsedMB: storageStats.storageUsedMB,
        percentageUsed: storageStats.percentageUsed,
        chartData: chartData.slice(0, 10),
      });
    }
  }, [address]);

  const pieData = [
    { name: "Used", value: stats.percentageUsed },
    { name: "Available", value: 100 - stats.percentageUsed },
  ];

  const COLORS = ["#8b5cf6", "#e5e7eb"];

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
              Statistics & Analytics
            </h1>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Conversations */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Conversations
                  </CardTitle>
                  <MessageSquare className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.conversationCount}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Chat sessions
                  </p>
                </CardContent>
              </Card>

              {/* Messages */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Messages
                  </CardTitle>
                  <MessageCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.messageCount}</div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    User and AI messages
                  </p>
                </CardContent>
              </Card>

              {/* Queries */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Queries Remaining
                  </CardTitle>
                  <Zap className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {queriesRemaining === -1 ? "∞" : queriesRemaining}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {currentPlan?.displayName} plan
                  </p>
                </CardContent>
              </Card>

              {/* Storage */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Storage Used
                  </CardTitle>
                  <HardDrive className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.storageUsedMB > 0
                      ? `${stats.storageUsedMB.toFixed(2)}MB`
                      : `${stats.storageUsedKB}KB`}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {stats.percentageUsed}% of 5MB
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Conversation Messages Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Messages per Conversation</CardTitle>
                  <CardDescription>Last 10 conversations</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={stats.chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="messages" fill="#8b5cf6" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-300 flex items-center justify-center text-gray-500">
                      No conversation data
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Storage Usage Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Storage Usage</CardTitle>
                  <CardDescription>Local storage capacity</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Subscription Info */}
            <Card>
              <CardHeader>
                <CardTitle>Current Subscription</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Plan Type
                    </p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {currentPlan?.displayName || "None"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Monthly Limit
                    </p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {currentPlan?.queryLimit === -1
                        ? "Unlimited"
                        : currentPlan?.queryLimit || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Status
                    </p>
                    <Badge className="text-base">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
