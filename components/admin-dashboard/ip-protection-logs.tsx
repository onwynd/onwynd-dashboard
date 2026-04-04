'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api/client';

interface LogEntry {
  id: number;
  user?: { first_name: string; last_name: string; email: string };
  platform: 'web' | 'dashboard';
  attempt_type: string;
  page_path: string;
  ip_address: string;
  created_at: string;
}

const ATTEMPT_LABELS: Record<string, string> = {
  devtools_open:    'DevTools opened',
  rightclick:       'Right-click attempted',
  f12:              'F12 pressed',
  clipboard_copy:   'Data copied',
  'keyboard_ctrl+s': 'Ctrl+S (save page)',
  'keyboard_ctrl+u': 'Ctrl+U (view source)',
  'keyboard_ctrl+shift+i': 'Ctrl+Shift+I (inspect)',
};

export function IPProtectionLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [platform, setPlatform] = useState<'all' | 'web' | 'dashboard'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Note: This endpoint should be implemented in the backend if not already
    apiClient.get('/admin/ip-protection/logs', {
      params: { platform: platform === 'all' ? undefined : platform },
    })
      .then(res => setLogs(res.data.data))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, [platform]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleString('en-NG', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          IP Protection Attempt Log
        </h3>
        <div className="flex gap-2">
          {(['all', 'web', 'dashboard'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                platform === p
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {p === 'all' ? 'All' : p === 'web' ? 'Patient App' : 'Dashboard'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-gray-500 py-8 text-center">Loading logs...</div>
      ) : logs.length === 0 ? (
        <div className="text-sm text-gray-400 py-8 text-center">
          No attempts logged yet. Enable "Log Suspicious Attempts" in protection settings.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Time</th>
                <th className="px-4 py-3 text-left">Platform</th>
                <th className="px-4 py-3 text-left">Attempt</th>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">IP</th>
                <th className="px-4 py-3 text-left">Page</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs">
                    {formatDate(log.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      log.platform === 'web'
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                    }`}>
                      {log.platform === 'web' ? 'Patient App' : 'Dashboard'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-medium">
                    {ATTEMPT_LABELS[log.attempt_type] ?? log.attempt_type}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    {log.user
                      ? `${log.user.first_name} ${log.user.last_name}`
                      : <span className="text-gray-400 italic">Guest</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 font-mono text-xs">
                    {log.ip_address}
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs max-w-xs truncate">
                    {log.page_path || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
