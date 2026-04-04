'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/api/client';

interface IPProtectionSettings {
  // Web
  ip_protection_web_enabled: boolean;
  ip_protect_web_devtools: boolean;
  ip_protect_web_rightclick: boolean;
  ip_protect_web_textselection: boolean;
  ip_protect_web_keyboard: boolean;
  ip_protect_web_dragging: boolean;
  ip_protect_web_log_attempts: boolean;
  // Dashboard
  ip_protection_dashboard_enabled: boolean;
  ip_protect_dash_devtools: boolean;
  ip_protect_dash_rightclick: boolean;
  ip_protect_dash_textselection: boolean;
  ip_protect_dash_keyboard: boolean;
  ip_protect_dash_clipboard: boolean;
  ip_protect_dash_log_attempts: boolean;
}

interface Props {
  userRole: 'admin' | 'ceo' | 'coo';
}

export function IPProtectionSettings({ userRole }: Props) {
  const [settings, setSettings] = useState<IPProtectionSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const canEditWeb = userRole === 'admin' || userRole === 'ceo';

  useEffect(() => {
    apiClient.get('/config/ip-protection').then((res: any) => setSettings(res.data));
  }, []);

  const toggle = (key: keyof IPProtectionSettings) => {
    setSettings(prev => prev ? { ...prev, [key]: !prev[key] } : prev);
  };

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await apiClient.post('/admin/ip-protection', settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (!settings) return <div className="p-6 text-gray-500">Loading...</div>;

  const ToggleRow = ({
    label, description, settingKey, disabled = false,
  }: {
    label: string;
    description: string;
    settingKey: keyof IPProtectionSettings;
    disabled?: boolean;
  }) => (
    <div className={`flex items-start justify-between py-4 border-b border-gray-100 ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
      <div className="flex-1 pr-8">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => toggle(settingKey)}
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
          settings[settingKey] ? 'bg-teal-600' : 'bg-gray-200 dark:bg-gray-700'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 mt-0.5 ${
            settings[settingKey] ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="space-y-8">

      {/* ── Web App Section ─────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Patient Web App Protection
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              onwynd.com — protects UI design and source code
              {!canEditWeb && <span className="ml-2 text-amber-600 font-medium">· Read-only for COO</span>}
            </p>
          </div>
          {/* Master toggle */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">Master switch</span>
            <button
              type="button"
              disabled={!canEditWeb}
              onClick={() => canEditWeb && toggle('ip_protection_web_enabled')}
              className={`relative inline-flex h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ${
                settings.ip_protection_web_enabled ? 'bg-teal-600' : 'bg-gray-200 dark:bg-gray-700'
              } ${!canEditWeb ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow mt-0.5 transition duration-200 ${
                settings.ip_protection_web_enabled ? 'translate-x-5' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        </div>

        <div className={`px-6 ${!canEditWeb || !settings.ip_protection_web_enabled ? 'opacity-50 pointer-events-none' : ''}`}>
          <ToggleRow
            label="Block Developer Tools (F12 / Ctrl+Shift+I)"
            description="Detects when DevTools is opened and shows a proprietary notice overlay. Closes when DevTools is closed."
            settingKey="ip_protect_web_devtools"
          />
          <ToggleRow
            label="Disable Right-Click Menu"
            description="Prevents the browser's right-click context menu on the platform UI."
            settingKey="ip_protect_web_rightclick"
          />
          <ToggleRow
            label="Disable Text Selection"
            description="Prevents selecting and copying UI text. Form inputs and text areas remain unaffected."
            settingKey="ip_protect_web_textselection"
          />
          <ToggleRow
            label="Block Save & Source Shortcuts"
            description="Blocks Ctrl+S (save page), Ctrl+U (view source), and related keyboard shortcuts."
            settingKey="ip_protect_web_keyboard"
          />
          <ToggleRow
            label="Prevent Element Dragging"
            description="Prevents UI elements from being dragged out of the browser window."
            settingKey="ip_protect_web_dragging"
          />
          <ToggleRow
            label="Log Suspicious Attempts"
            description="Records DevTools open attempts with user ID, IP address, and page path for review."
            settingKey="ip_protect_web_log_attempts"
          />
        </div>
      </div>

      {/* ── Dashboard Section ───────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Dashboard Protection
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              dashboard.onwynd.com — protects business data and proprietary workflows
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">Master switch</span>
            <button
              type="button"
              onClick={() => toggle('ip_protection_dashboard_enabled')}
              className={`relative inline-flex h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ${
                settings.ip_protection_dashboard_enabled ? 'bg-teal-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow mt-0.5 transition duration-200 ${
                settings.ip_protection_dashboard_enabled ? 'translate-x-5' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        </div>

        <div className={`px-6 ${!settings.ip_protection_dashboard_enabled ? 'opacity-50 pointer-events-none' : ''}`}>
          <ToggleRow
            label="Block Developer Tools"
            description="Overlay with stronger warning than the web app — references confidential business data."
            settingKey="ip_protect_dash_devtools"
          />
          <ToggleRow
            label="Disable Right-Click Menu"
            description="Prevents right-click on all dashboard views."
            settingKey="ip_protect_dash_rightclick"
          />
          <ToggleRow
            label="Disable Text Selection on Data"
            description="Prevents text selection on data tables, charts, and metric cards only. Form inputs unaffected."
            settingKey="ip_protect_dash_textselection"
          />
          <ToggleRow
            label="Block Save & Source Shortcuts"
            description="Blocks keyboard shortcuts used to save or inspect page source."
            settingKey="ip_protect_dash_keyboard"
          />
          <ToggleRow
            label="Clipboard Monitoring (Dashboard Only)"
            description="When data is copied from the dashboard, shows a brief notice that copying is monitored. Does NOT prevent the copy — the user can still copy normally."
            settingKey="ip_protect_dash_clipboard"
          />
          <ToggleRow
            label="Log All Suspicious Attempts"
            description="Logs DevTools, clipboard, and keyboard shortcut attempts with user identity and timestamp."
            settingKey="ip_protect_dash_log_attempts"
          />
        </div>
      </div>

      {/* ── Info box ─────────────────────────────────────────────── */}
      <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 px-5 py-4 text-sm text-amber-800 dark:text-amber-400 leading-relaxed">
        <strong className="block mb-1">What this protects — and what it does not</strong>
        These measures raise the barrier for casual copying and deter
        non-technical competitors. A determined developer with sufficient
        skill can always bypass client-side protections. The value here
        is: legal documentation that you actively protected your IP,
        deterrence of 95% of casual attempts, and an audit trail for
        any dispute. Therapy session pages (/session/, /join/) are
        always exempt — patient care is never affected.
      </div>

      {/* ── Save button ──────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="px-6 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-medium
            hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'Saving...' : 'Save Protection Settings'}
        </button>
        {saved && (
          <span className="text-sm text-teal-600 font-medium">
            ✓ Settings saved and live
          </span>
        )}
      </div>
    </div>
  );
}
