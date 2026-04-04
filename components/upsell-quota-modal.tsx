"use client";

import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Heart, Clock, Headphones, Star, TrendingUp } from "lucide-react";

interface UpsellData {
  message: string;
  subscribe_url: string;
  cta: string;
  description: string;
  price: string;
  benefits: string[];
}

interface UpsellQuotaModalProps {
  upsellData?: UpsellData;
  onClose?: () => void;
}

export function UpsellQuotaModal({ upsellData, onClose }: UpsellQuotaModalProps) {
  const isOpen = !!upsellData;
  const router = useRouter();

  const handleClose = () => {
    onClose?.();
  };

  const handleSubscribe = () => {
    if (upsellData?.subscribe_url) {
      router.push(upsellData.subscribe_url);
    }
    handleClose();
  };

  if (!upsellData) return null;

  const benefitIcons = [
    <Heart key="heart" className="h-4 w-4 text-red-500" />,
    <Clock key="clock" className="h-4 w-4 text-blue-500" />,
    <Headphones key="headphones" className="h-4 w-4 text-purple-500" />,
    <Star key="star" className="h-4 w-4 text-yellow-500" />,
    <TrendingUp key="trending" className="h-4 w-4 text-green-500" />,
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        <div className="relative bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950 dark:via-pink-950 dark:to-blue-950">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2">
            <div className="w-32 h-32 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-20 blur-2xl"></div>
          </div>
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2">
            <div className="w-40 h-40 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-20 blur-3xl"></div>
          </div>

          <div className="relative z-10">
            <DialogHeader className="text-center p-6 pb-4">
              <div className="mx-auto mb-4 w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Your Mental Health Matters
              </DialogTitle>
              <DialogDescription className="text-base text-gray-600 dark:text-gray-300 mt-2">
                {upsellData.message}
              </DialogDescription>
            </DialogHeader>

            <div className="px-6 pb-6">
              <Card className="border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    {upsellData.description}
                  </p>

                  <div className="space-y-3 mb-6">
                    {upsellData.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-3">
                        {benefitIcons[index % benefitIcons.length]}
                        <span className="text-sm text-gray-700 dark:text-gray-200">
                          {benefit}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg">
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {upsellData.price}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        per month
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                      Premium Access
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            <DialogFooter className="flex gap-3 p-6 pt-0">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Maybe Later
              </Button>
              <Button
                onClick={handleSubscribe}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                {upsellData.cta}
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}