"use client";

import { CheckCircle2, XCircle, AlertCircle, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LocalModelStatusProps {
  status: "available" | "unavailable" | "unknown" | "error" | "loading";
  reason?: string | null;
  className?: string;
}

export function LocalModelStatus({
  status,
  reason,
  className = "",
}: LocalModelStatusProps) {
  const config = {
    available: {
      icon: CheckCircle2,
      label: "Available",
      className: "text-green-600 bg-green-50 border-green-200",
    },
    unavailable: {
      icon: XCircle,
      label: "Unavailable",
      className: "text-gray-600 bg-gray-50 border-gray-200",
    },
    unknown: {
      icon: HelpCircle,
      label: "Unknown",
      className: "text-yellow-600 bg-yellow-50 border-yellow-200",
    },
    error: {
      icon: AlertCircle,
      label: "Error",
      className: "text-red-600 bg-red-50 border-red-200",
    },
    loading: {
      icon: HelpCircle,
      label: "Testing...",
      className: "text-blue-600 bg-blue-50 border-blue-200",
    },
  };

  const { icon: Icon, label, className: statusClassName } = config[status];

  const badge = (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusClassName} ${className}`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{label}</span>
    </div>
  );

  if (reason) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <span>{badge}</span>
          </TooltipTrigger>
          <TooltipContent className="max-w-sm">
            <p className="text-sm">{reason}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return badge;
}

export function BackendStatusBadge({
  backend,
  isFallback,
  fallbackReason,
}: {
  backend: string;
  isFallback?: boolean;
  fallbackReason?: string | null;
}) {
  if (backend === "local" && !isFallback) {
    return (
      <LocalModelStatus
        status="available"
        reason="Local Qwen3-VL model is active"
      />
    );
  }

  if (isFallback) {
    return (
      <LocalModelStatus
        status="unknown"
        reason={fallbackReason || "Switched to Gemini fallback"}
      />
    );
  }

  if (backend === "gemini") {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border text-blue-600 bg-blue-50 border-blue-200">
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
        <span>Gemini</span>
      </div>
    );
  }

  return <LocalModelStatus status="unknown" />;
}
