'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

interface DashboardIPConfig {
  ip_protection_dashboard_enabled: boolean;
  ip_protect_dash_devtools: boolean;
  ip_protect_dash_rightclick: boolean;
  ip_protect_dash_textselection: boolean;
  ip_protect_dash_keyboard: boolean;
  ip_protect_dash_clipboard: boolean;
  ip_protect_dash_log_attempts: boolean;
}

const logAttempt = async (type: string, path: string, enabled: boolean) => {
  if (!enabled) return;
  try {
    const token = localStorage.getItem('onwynd_token') ||
                  document.cookie.match(/onwynd_token=([^;]+)/)?.[1];
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    
    await fetch(`${apiUrl}/v1/config/ip-protection/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ platform: 'dashboard', attempt_type: type, page_path: path }),
      keepalive: true,
    });
  } catch {
    // Never crash on a log failure
  }
};

export function useDashboardIPProtection(config: DashboardIPConfig | null) {
  const pathname = usePathname();
  const devToolsRef = useRef<HTMLDivElement | null>(null);
  const clipboardToastRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!config?.ip_protection_dashboard_enabled) return;

    const handlers: Array<() => void> = [];

    // ── Right-click ────────────────────────────────────────────────────
    if (config.ip_protect_dash_rightclick) {
      const handler = (e: MouseEvent) => {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
          return;
        }
        e.preventDefault();
        logAttempt('rightclick', pathname, config.ip_protect_dash_log_attempts);
      };
      document.addEventListener('contextmenu', handler);
      handlers.push(() => document.removeEventListener('contextmenu', handler));
    }

    // ── Keyboard shortcuts ─────────────────────────────────────────────
    if (config.ip_protect_dash_keyboard) {
      const BLOCKED = new Set([
        'ctrl+s', 'ctrl+u', 'ctrl+shift+i', 'ctrl+shift+j',
        'ctrl+shift+c', 'f12', 'meta+s', 'meta+option+i',
      ]);

      const handler = (e: KeyboardEvent) => {
        const ctrl  = e.ctrlKey || e.metaKey;
        const shift = e.shiftKey;
        const alt   = e.altKey;
        const key   = e.key.toLowerCase();
        const combo = [ctrl && 'ctrl', shift && 'shift', alt && 'option', key]
          .filter(Boolean).join('+');

        if (BLOCKED.has(combo) || e.key === 'F12') {
          e.preventDefault();
          e.stopPropagation();
          logAttempt(`keyboard_${combo || 'f12'}`, pathname, config.ip_protect_dash_log_attempts);
        }
      };

      document.addEventListener('keydown', handler, true);
      handlers.push(() => document.removeEventListener('keydown', handler, true));
    }

    // ── Text selection ─────────────────────────────────────────────────
    if (config.ip_protect_dash_textselection) {
      const style = document.createElement('style');
      style.id = 'onwynd-dash-noselect';
      // More targeted than the web app — apply to data tables and charts only
      style.textContent = `
        table, [data-protected], .recharts-wrapper, .chart-container {
          -webkit-user-select: none !important;
          user-select: none !important;
        }
      `;
      document.head.appendChild(style);
      handlers.push(() => {
        document.getElementById('onwynd-dash-noselect')?.remove();
      });
    }

    // ── Clipboard intercept ────────────────────────────────────────────
    if (config.ip_protect_dash_clipboard) {
      const handler = (e: ClipboardEvent) => {
        logAttempt('clipboard_copy', pathname, config.ip_protect_dash_log_attempts);
        showClipboardNotice();
      };
      document.addEventListener('copy', handler);
      handlers.push(() => document.removeEventListener('copy', handler));
    }

    // ── DevTools detection ─────────────────────────────────────────────
    if (config.ip_protect_dash_devtools) {
      let open = false;
      const THRESHOLD = 160;

      const show = () => {
        if (devToolsRef.current) return;
        const overlay = document.createElement('div');
        overlay.id = 'onwynd-dash-devtools';
        overlay.innerHTML = `
          <div style="
            position:fixed;inset:0;z-index:999999;
            background:rgba(10,22,40,0.98);
            display:flex;flex-direction:column;
            align-items:center;justify-content:center;
            font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
          ">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style="margin-bottom:20px">
              <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                stroke="#C8922A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <h2 style="color:#fff;font-size:18px;font-weight:600;margin:0 0 10px">
              Unauthorised access attempt detected
            </h2>
            <p style="color:#aaa;font-size:13px;text-align:center;max-width:360px;line-height:1.6;margin:0 0 8px">
              This dashboard contains proprietary and confidential business data.
              Inspection via developer tools is not permitted and has been logged.
            </p>
            <p style="color:#666;font-size:12px;margin:0 0 28px">
              Attempt reference: ${Date.now()}
            </p>
            <button id="close-dash-devtools"
              style="background:#C8922A;color:#fff;border:none;padding:10px 28px;
                border-radius:8px;font-size:13px;font-weight:500;cursor:pointer">
              I understand
            </button>
          </div>
        `;
        document.body.appendChild(overlay);
        devToolsRef.current = overlay;

        const closeBtn = overlay.querySelector('#close-dash-devtools');
        closeBtn?.addEventListener('click', () => {
            overlay.remove();
            devToolsRef.current = null;
        });

        logAttempt('devtools_open', pathname, config.ip_protect_dash_log_attempts);
      };

      const hide = () => {
        devToolsRef.current?.remove();
        devToolsRef.current = null;
      };

      const check = () => {
        const opened = (window.outerWidth - window.innerWidth)   > THRESHOLD ||
                       (window.outerHeight - window.innerHeight) > THRESHOLD;
        if (opened && !open)  { open = true;  show(); }
        if (!opened && open)  { open = false; hide(); }
      };

      const interval = setInterval(check, 1000);
      handlers.push(() => {
        clearInterval(interval);
        hide();
      });
    }

    return () => {
      handlers.forEach(fn => fn());
    };
  }, [config, pathname]);

  // Clipboard notice toast (non-blocking)
  const showClipboardNotice = () => {
    if (clipboardToastRef.current) return;
    const toast = document.createElement('div');
    toast.innerHTML = `
      <div style="
        position:fixed;bottom:24px;right:24px;z-index:99999;
        background:#1A1A2E;color:#fff;border-left:3px solid #C8922A;
        padding:12px 20px;border-radius:6px;font-size:13px;
        font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
        box-shadow:0 4px 24px rgba(0,0,0,0.3);max-width:320px;
      ">
        <strong style="display:block;margin-bottom:4px;color:#C8922A">
          Data copy logged
        </strong>
        Dashboard data is confidential. Copying is monitored as per
        the Onwynd platform policy.
      </div>
    `;
    document.body.appendChild(toast);
    clipboardToastRef.current = toast;
    setTimeout(() => {
      toast.remove();
      clipboardToastRef.current = null;
    }, 5000);
  };
}
