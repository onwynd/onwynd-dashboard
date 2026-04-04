"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useTechStore } from "@/store/tech-store";

export function WelcomeSection() {
  const setShowAlertBanner = useTechStore((state) => state.setShowAlertBanner);

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 sm:p-8 text-white shadow-lg">
      <div className="relative z-10 max-w-2xl">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
          System Overview
        </h1>
        <p className="text-blue-100 text-sm sm:text-base mb-6">
          Monitor system performance, track incidents, and manage technical infrastructure in real-time.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button
            size="sm"
            variant="secondary"
            className="bg-white text-blue-600 hover:bg-blue-50 border-0"
          >
            View Logs
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="bg-blue-600/50 text-white border-white/20 hover:bg-blue-600/70"
          >
            System Status
          </Button>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-white/10 to-transparent transform skew-x-12" />
      <div className="absolute right-10 bottom-10 size-32 rounded-full bg-blue-500/30 blur-3xl" />
      
      <button 
        onClick={() => setShowAlertBanner(false)}
        className="absolute top-4 right-4 p-1 text-blue-100 hover:text-white hover:bg-white/10 rounded-full transition-colors"
      >
        <X size={20} />
      </button>
    </div>
  );
}
