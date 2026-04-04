"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { useAmbassadorStore } from "@/store/ambassador-store";
import { useEffect } from "react";

export function ReferralTable() {
  const referrals = useAmbassadorStore((state) => state.referrals);
  const fetchReferrals = useAmbassadorStore((state) => state.fetchReferrals);

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent Referrals</CardTitle>
        <CardDescription>Track your recent sign-ups and earnings</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead className="text-right">Earnings</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {referrals.map((referral) => (
              <TableRow key={referral.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      <AvatarImage src={referral.avatar} />
                      <AvatarFallback>{referral.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{referral.name}</span>
                      <span className="text-xs text-muted-foreground">{referral.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{referral.date}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      referral.status === "Active"
                        ? "default"
                        : referral.status === "Pending"
                        ? "secondary"
                        : "destructive"
                    }
                    className="text-[10px]"
                  >
                    {referral.status}
                  </Badge>
                </TableCell>
                <TableCell>{referral.plan}</TableCell>
                <TableCell className="text-right font-medium">{referral.earnings}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" className="size-8">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
