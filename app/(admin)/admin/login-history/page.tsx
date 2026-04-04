"use client";

import { useEffect, useState, useCallback } from "react";
import { adminService } from "@/lib/api/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { PageHeader } from "@/components/shared/page-header";
import { TableBodyShimmer } from "@/components/shared/shimmer-skeleton";
import {
  History,
  Mail,
  Search,
  RefreshCw,
  Smartphone,
  Monitor,
  Tablet,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { formatDistanceToNow, isAfter, subDays } from "date-fns";

interface LoginHistoryRow {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  auth_provider: string;
  event_type: string;
  device_type: string;
  browser: string;
  os: string;
  ip_address: string;
  location: string;
  created_at: string;
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

const PROVIDER_CONFIG: Record<
  string,
  { label: string; className: string; icon?: React.ReactNode }
> = {
  email: {
    label: "Email",
    className: "bg-gray-100 text-gray-700 hover:bg-gray-100",
    icon: <Mail className="h-3 w-3" />,
  },
  google: {
    label: "Google",
    className: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  },
  apple: {
    label: "Apple",
    className: "bg-gray-900 text-white hover:bg-gray-900",
  },
  facebook: {
    label: "Facebook",
    className: "bg-indigo-100 text-indigo-700 hover:bg-indigo-100",
  },
  firebase: {
    label: "Firebase",
    className: "bg-orange-100 text-orange-700 hover:bg-orange-100",
  },
};

const EVENT_CONFIG: Record<string, { label: string; className: string }> = {
  login: {
    label: "Login",
    className: "bg-green-100 text-green-700 hover:bg-green-100",
  },
  register: {
    label: "Register",
    className: "bg-teal-100 text-teal-700 hover:bg-teal-100",
  },
  password_changed: {
    label: "Password Changed",
    className: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  },
  logout: {
    label: "Logout",
    className: "bg-gray-100 text-gray-600 hover:bg-gray-100",
  },
  sso: {
    label: "SSO",
    className: "bg-purple-100 text-purple-700 hover:bg-purple-100",
  },
};

function DeviceIcon({ deviceType }: { deviceType: string }) {
  if (deviceType === "mobile") return <Smartphone className="h-4 w-4 shrink-0 text-muted-foreground" />;
  if (deviceType === "tablet") return <Tablet className="h-4 w-4 shrink-0 text-muted-foreground" />;
  return <Monitor className="h-4 w-4 shrink-0 text-muted-foreground" />;
}

function ProviderBadge({ provider }: { provider: string }) {
  const cfg = PROVIDER_CONFIG[provider] ?? {
    label: provider,
    className: "bg-gray-100 text-gray-700 hover:bg-gray-100",
  };
  return (
    <Badge className={`gap-1 font-normal ${cfg.className}`}>
      {cfg.icon}
      {cfg.label}
    </Badge>
  );
}

function EventBadge({ event }: { event: string }) {
  const cfg = EVENT_CONFIG[event] ?? {
    label: event,
    className: "bg-gray-100 text-gray-600 hover:bg-gray-100",
  };
  return <Badge className={`font-normal ${cfg.className}`}>{cfg.label}</Badge>;
}

export default function LoginHistoryPage() {
  const [rows, setRows] = useState<LoginHistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [eventType, setEventType] = useState("all");
  const [authProvider, setAuthProvider] = useState("all");
  const [deviceType, setDeviceType] = useState("all");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);

  const fetchHistory = useCallback(
    async (p = 1) => {
      setLoading(true);
      try {
        const params: Record<string, unknown> = { page: p, per_page: 20 };
        if (search) params.search = search;
        if (eventType !== "all") params.event_type = eventType;
        if (authProvider !== "all") params.auth_provider = authProvider;
        if (deviceType !== "all") params.device_type = deviceType;

        const data = (await adminService.getLoginHistory(params)) as any;
        const list: LoginHistoryRow[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : [];
        setRows(list);
        if (data?.meta) setMeta(data.meta);
        else if (data?.current_page !== undefined) setMeta(data as PaginationMeta);
        else setMeta(null);
        setPage(p);
      } catch {
        toast({
          title: "Error",
          description: "Failed to load login history.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [search, eventType, authProvider, deviceType]
  );

  useEffect(() => {
    fetchHistory(1);
  }, [fetchHistory]);

  // Compute stats from current data (or API could return aggregate counts)
  const totalEvents = meta?.total ?? rows.length;
  const uniqueUsers = new Set(rows.map((r) => r.user_id)).size;
  const firebaseSignups = rows.filter(
    (r) => r.auth_provider === "firebase" && r.event_type === "register"
  ).length;
  const weekAgo = subDays(new Date(), 7);
  const passwordChangesThisWeek = rows.filter(
    (r) =>
      r.event_type === "password_changed" &&
      isAfter(new Date(r.created_at), weekAgo)
  ).length;

  const currentPage = meta?.current_page ?? page;
  const lastPage = meta?.last_page ?? 1;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <PageHeader
        title="Login History"
        subtitle="Signup method, device, browser, and location for every auth event"
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchHistory(currentPage)}
          disabled={loading}
        >
          {loading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Events", value: totalEvents },
          { label: "Unique Users", value: uniqueUsers },
          { label: "Firebase Signups", value: firebaseSignups },
          { label: "Password Changes (this week)", value: passwordChangesThisWeek },
        ].map(({ label, value }) => (
          <Card key={label}>
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name or email…"
            className="pl-9 w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select value={eventType} onValueChange={(v) => setEventType(v ?? eventType)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Event type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            <SelectItem value="login">Login</SelectItem>
            <SelectItem value="register">Register</SelectItem>
            <SelectItem value="password_changed">Password Changed</SelectItem>
            <SelectItem value="sso">SSO</SelectItem>
          </SelectContent>
        </Select>

        <Select value={authProvider} onValueChange={(v) => setAuthProvider(v ?? authProvider)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Auth provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Providers</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="google">Google</SelectItem>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="facebook">Facebook</SelectItem>
            <SelectItem value="firebase">Firebase</SelectItem>
          </SelectContent>
        </Select>

        <Select value={deviceType} onValueChange={(v) => setDeviceType(v ?? deviceType)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Device" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Devices</SelectItem>
            <SelectItem value="mobile">Mobile</SelectItem>
            <SelectItem value="desktop">Desktop</SelectItem>
            <SelectItem value="tablet">Tablet</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="px-4 py-3 text-xs uppercase">User</TableHead>
                  <TableHead className="px-4 py-3 text-xs uppercase">Auth Provider</TableHead>
                  <TableHead className="px-4 py-3 text-xs uppercase">Event</TableHead>
                  <TableHead className="px-4 py-3 text-xs uppercase">Device &amp; Browser</TableHead>
                  <TableHead className="px-4 py-3 text-xs uppercase">Location</TableHead>
                  <TableHead className="px-4 py-3 text-xs uppercase">IP Address</TableHead>
                  <TableHead className="px-4 py-3 text-xs uppercase">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableBodyShimmer rows={8} cols={7} />
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-16 text-muted-foreground"
                    >
                      <History className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      No login history found.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="px-4 py-3">
                        <p className="text-sm font-medium">{row.user_name}</p>
                        <p className="text-xs text-muted-foreground">{row.user_email}</p>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <ProviderBadge provider={row.auth_provider} />
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <EventBadge event={row.event_type} />
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <DeviceIcon deviceType={row.device_type} />
                          <div>
                            <p className="text-sm">{row.browser || "—"}</p>
                            <p className="text-xs text-muted-foreground">{row.os || ""}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-muted-foreground">
                        {row.location || "—"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm font-mono text-muted-foreground">
                        {row.ip_address || "—"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                        {row.created_at
                          ? formatDistanceToNow(new Date(row.created_at), { addSuffix: true })
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {meta && lastPage > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-xs text-muted-foreground">
                Page {currentPage} of {lastPage} · {meta.total} events
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1 || loading}
                  onClick={() => fetchHistory(currentPage - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= lastPage || loading}
                  onClick={() => fetchHistory(currentPage + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
