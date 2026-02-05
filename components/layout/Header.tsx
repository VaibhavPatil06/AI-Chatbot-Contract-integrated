"use client";

import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks";
import {
  connectWallet,
  disconnectWallet,
} from "@/lib/redux/slices/walletSlice";
import { toggleTheme, toggleSidebar } from "@/lib/redux/slices/uiSlice";
import {
  Wallet,
  Sun,
  Moon,
  Menu,
  Zap,
  Shield,
  Globe,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { formatters } from "@/lib/utils/formatters";

export default function Header() {
  const dispatch = useAppDispatch();
  const { connected, address, balance, connecting, networkInfo } =
    useAppSelector((state) => state.wallet);
  const { theme, sidebarCollapsed } = useAppSelector((state) => state.ui);
  const { currentPlan, queriesRemaining } = useAppSelector(
    (state) => state.subscription,
  );

  const handleWalletToggle = () => {
    if (connected) {
      dispatch(disconnectWallet());
    } else {
      dispatch(connectWallet());
    }
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-4">
          {sidebarCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dispatch(toggleSidebar())}
            >
              <Menu className="w-5 h-5" />
            </Button>
          )}

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                AI Chat Pro
              </h1>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Shield className="w-3 h-3" />
                <span>Decentralized</span>
                {networkInfo && (
                  <>
                    <Globe className="w-3 h-3 ml-2" />
                    <span>{networkInfo.name}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Free tier indicator */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-amber-50 dark:bg-amber-900/20 rounded-full">
            <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
              Free Tier
            </span>
          </div>

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dispatch(toggleTheme())}
            className="w-9 h-9 p-0"
          >
            {theme === "light" ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4" />
            )}
          </Button>

          {/* Wallet section */}
          {connected ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="hidden sm:inline">
                    {formatters.address(address || "")}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      Wallet Connected
                    </span>
                    <Badge
                      variant="outline"
                      className="text-green-600 border-green-300"
                    >
                      Connected
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Address:
                      </span>
                      <span className="font-mono">
                        {formatters.address(address || "")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Balance:
                      </span>
                      <span className="font-mono">
                        {formatters.currency(balance)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Network:
                      </span>
                      <span>{networkInfo?.name || "Ethereum"}</span>
                    </div>
                  </div>
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={handleWalletToggle}
                  className="text-red-600 dark:text-red-400"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Disconnect Wallet
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={handleWalletToggle}
              disabled={connecting}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
            >
              <Wallet className="w-4 h-4 mr-2" />
              {connecting ? "Connecting..." : "Connect Wallet"}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
