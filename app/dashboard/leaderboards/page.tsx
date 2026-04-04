"use client";

import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useGamificationStore } from "@/store/gamification-store";
import { exportToCsv } from "@/lib/export-utils";
import { Download } from "lucide-react";

export default function LeaderboardsPage() {
  const leaderboard = useGamificationStore((s) => s.leaderboard);
  const isLoading = useGamificationStore((s) => s.isLoading);
  const type = useGamificationStore((s) => s.leaderboardType);
  const period = useGamificationStore((s) => s.leaderboardPeriod);
  const fetchLeaderboards = useGamificationStore((s) => s.fetchLeaderboards);

  useEffect(() => {
    fetchLeaderboards(type, period);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleExport() {
    const rows = leaderboard.map((r) => ({
      rank: r.rank,
      user: r.user_name || r.username || "",
      score: r.score,
    }));
    exportToCsv(`leaderboard-${type}-${period}.csv`, rows);
  }

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Leaderboards</h2>
          <p className="text-sm text-muted-foreground">See how you stack up this {period.replace("_", " ")}</p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={type}
            onValueChange={(v: string | null) => fetchLeaderboards((v ?? "") as typeof type, period)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Leaderboard type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="streak">Streak Keepers</SelectItem>
              <SelectItem value="check_ins">Check-In Champions</SelectItem>
              <SelectItem value="community_support">Community Heroes</SelectItem>
              <SelectItem value="therapy_sessions">Therapy Sessions</SelectItem>
              <SelectItem value="progress_makers">Progress Makers</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={period}
            onValueChange={(v: string | null) => fetchLeaderboards(type, (v ?? "") as typeof period)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">This Week</SelectItem>
              <SelectItem value="monthly">This Month</SelectItem>
              <SelectItem value="all_time">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport} disabled={!leaderboard.length}>
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Top Rankings</CardTitle>
            <CardDescription>Top users by {type.replace("_", " ")}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="overflow-auto">
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Rank</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead className="w-[120px] text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.map((entry, idx) => (
                  <TableRow key={`${entry.rank}-${idx}`}>
                    <TableCell>{entry.rank}</TableCell>
                    <TableCell>{entry.user_name || entry.username || "—"}</TableCell>
                    <TableCell className="text-right">{entry.score}</TableCell>
                  </TableRow>
                ))}
                {!leaderboard.length && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-6">
                      {isLoading ? "Loading..." : "No leaderboard data."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

