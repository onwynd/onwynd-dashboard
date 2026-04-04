"use client";

import { useState, useEffect } from "react";
import { mindfulnessService, Soundscape } from "@/lib/api/mindfulness";
import { UpsellQuotaModal } from "@/components/upsell-quota-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Headphones, Clock, Play } from "lucide-react";
import { toast } from "sonner";

interface UpsellData {
  message: string;
  subscribe_url: string;
  cta: string;
  description: string;
  price: string;
  benefits: string[];
}

export default function PatientResourcesPage() {
  const [soundscapes, setSoundscapes] = useState<Soundscape[]>([]);
  const [loading, setLoading] = useState(true);
  const [upsellData, setUpsellData] = useState<UpsellData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchSoundscapes = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await mindfulnessService.getSoundscapes(page);
      setSoundscapes(response.data);
      setTotalPages(response.pagination.last_page);
      setCurrentPage(response.pagination.current_page);
    } catch (error: unknown) {
      const err = error as { response?: { status?: number; data?: { upsell?: UpsellData } } };
      const upsellPayload = err.response?.data?.upsell;
      if (err.response?.status === 429 && upsellPayload) {
        setUpsellData(upsellPayload);
      } else {
        toast.error("Failed to load soundscapes");
      }
    } finally {
      setLoading(false);
    }
  };

  const startSession = async (soundscape: Soundscape) => {
    try {
      if (!soundscape.is_free_preview && !soundscape.full_url) {
        // Premium content without full access
        setUpsellData({
          message: "You've hit your limit, but your mental health shouldn't have limits",
          subscribe_url: "/subscription/upgrade",
          cta: "Unlock Unlimited Access",
          description: "Continue your wellness journey with unlimited mindfulness sessions and premium content.",
          price: "₦2,999/mo",
          benefits: [
            "Unlimited mindfulness sessions",
            "Premium soundscapes and meditations",
            "Personalized wellness recommendations",
            "Priority customer support",
            "Advanced progress tracking"
          ]
        });
        return;
      }

      await mindfulnessService.startSession(soundscape.id);
      toast.success("Session started! Enjoy your mindfulness practice.");
      
      // Here you would typically open an audio player or navigate to a session page
      if (soundscape.full_url || soundscape.preview_url) {
        window.open(soundscape.full_url || soundscape.preview_url, '_blank');
      }
    } catch (error: unknown) {
      const err = error as { response?: { status?: number; data?: { upsell?: UpsellData } } };
      const upsellPayload = err.response?.data?.upsell;
      if (err.response?.status === 429 && upsellPayload) {
        setUpsellData(upsellPayload);
      } else {
        toast.error("Failed to start session");
      }
    }
  };

  useEffect(() => {
    fetchSoundscapes();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading mindfulness resources...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mindfulness Resources</h1>
          <p className="text-muted-foreground">
            Discover calming soundscapes and guided meditations for your wellness journey
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {soundscapes.map((soundscape) => (
          <Card key={soundscape.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Badge variant={soundscape.is_free_preview ? "secondary" : "premium"}>
                  {soundscape.is_free_preview ? "Free" : "Premium"}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {soundscape.duration_minutes}min
                </div>
              </div>
              <CardTitle className="text-lg">{soundscape.title}</CardTitle>
              <CardDescription>{soundscape.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                {soundscape.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <Button
                onClick={() => startSession(soundscape)}
                className="w-full"
                variant={soundscape.is_free_preview ? "default" : "premium"}
              >
                {soundscape.is_free_preview ? (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Play Now
                  </>
                ) : (
                  <>
                    <Headphones className="h-4 w-4 mr-2" />
                    {soundscape.full_url ? "Play Premium" : "Unlock Access"}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => fetchSoundscapes(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => fetchSoundscapes(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Next
          </Button>
        </div>
      )}

      <UpsellQuotaModal
        upsellData={upsellData ?? undefined}
        onClose={() => setUpsellData(null)}
      />
    </div>
  );
}
