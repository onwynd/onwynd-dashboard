'use client';

import { createContext, useEffect, useState } from 'react';
import { useDashboardIPProtection } from '@/hooks/useIPProtection';

interface DashboardIPConfig {
  ip_protection_dashboard_enabled: boolean;
  ip_protect_dash_devtools: boolean;
  ip_protect_dash_rightclick: boolean;
  ip_protect_dash_textselection: boolean;
  ip_protect_dash_keyboard: boolean;
  ip_protect_dash_clipboard: boolean;
  ip_protect_dash_log_attempts: boolean;
}

export function DashboardIPProtectionProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<DashboardIPConfig | null>(null);

  useEffect(() => {
    const cached = sessionStorage.getItem('onwynd_dash_ip_config');
    const cacheTs = sessionStorage.getItem('onwynd_dash_ip_config_ts');
    const isStale = !cacheTs || Date.now() - parseInt(cacheTs) > 5 * 60 * 1000;

    if (cached && !isStale) {
      setConfig(JSON.parse(cached));
      return;
    }

    const token = localStorage.getItem('onwynd_token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    
    fetch(`${apiUrl}/v1/config/ip-protection`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(r => r.json())
      .then(res => {
        const data = res.data;
        setConfig(data);
        sessionStorage.setItem('onwynd_dash_ip_config', JSON.stringify(data));
        sessionStorage.setItem('onwynd_dash_ip_config_ts', Date.now().toString());
      })
      .catch(() => setConfig(null));
  }, []);

  useDashboardIPProtection(config);

  return <>{children}</>;
}
