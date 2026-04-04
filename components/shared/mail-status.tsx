"use client";

import React, { useState, useEffect } from "react";
import { Mail, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import client from "@/lib/api/client";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function MailStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [provider, setProvider] = useState("");

  const checkStatus = async () => {
    try {
      const res = await client.post("/api/v1/admin/mail/test-connection");
      if (res.data.success) {
        setStatus('connected');
        setProvider(res.data.provider || "");
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 300000); // Check every 5 mins
    return () => clearInterval(interval);
  }, []);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1 cursor-help">
            {status === 'checking' && <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />}
            {status === 'connected' && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
            {status === 'error' && <AlertCircle className="w-3.5 h-3.5 text-red-500" />}
            <span className="text-[10px] font-medium uppercase tracking-wider opacity-70">
              {provider ? provider.replace('_imap', '') : 'Mail'}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">
            {status === 'checking' && "Checking mail server connection..."}
            {status === 'connected' && `Successfully connected to ${provider}`}
            {status === 'error' && "Mail server connection error. Check settings."}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
