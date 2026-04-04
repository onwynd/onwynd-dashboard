import { AppConfig } from "@/lib/config";

interface StripeCheckoutParams {
  priceId: string;
  successUrl?: string;
  cancelUrl?: string;
}

class StripeService {
  private getAuthToken(): string {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("auth_token") || "";
  }

  async checkout(params: StripeCheckoutParams): Promise<string> {
    const response = await fetch(AppConfig.getApiUrl("/api/v1/payments/stripe/checkout"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.getAuthToken()}`,
      },
      body: JSON.stringify({
        price_id: params.priceId,
        success_url: params.successUrl ?? `${typeof window !== "undefined" ? window.location.origin : ""}/subscription/success`,
        cancel_url: params.cancelUrl ?? `${typeof window !== "undefined" ? window.location.origin : ""}/subscription`,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error((error as Record<string, unknown>)?.message as string || "Stripe checkout failed");
    }

    const json = await response.json();
    const anyJson = json as unknown as {
      data?: {
        url?: string;
        session_url?: string;
      };
      url?: string;
      session_url?: string;
    };
    const url = anyJson?.data?.url ?? anyJson?.data?.session_url ?? anyJson?.url ?? anyJson?.session_url;
    if (!url) throw new Error("Invalid Stripe response");
    return url;
  }
}

export const stripeService = new StripeService();

