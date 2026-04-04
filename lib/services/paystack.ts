import { AppConfig } from "@/lib/config";

interface PaystackPaymentParams {
  amount: number;
  email: string;
  planUuid?: string;
}

interface PaymentInitResponse {
  authorization_url?: string;
  access_code?: string;
  reference?: string;
}

interface PaymentVerifyResponse {
  success: boolean;
  data: unknown;
}

class PaystackService {
  private getAuthToken(): string {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("auth_token") || "";
  }

  async initializePayment(params: PaystackPaymentParams): Promise<string> {
    const response = await fetch(AppConfig.getApiUrl("/api/v1/payments/initialize"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.getAuthToken()}`,
      },
      body: JSON.stringify({
        amount: Math.round(params.amount * 100),
        email: params.email,
        ...(params.planUuid ? { plan_uuid: params.planUuid } : {}),
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error((error as Record<string, unknown>)?.message as string || "Payment initialization failed");
    }

    const json = await response.json();
    const data: PaymentInitResponse = json?.data ?? json;
    const url = data.authorization_url;
    if (!url) throw new Error("Invalid response from payment gateway");
    return url;
  }

  async verifyPayment(reference: string): Promise<PaymentVerifyResponse> {
    const response = await fetch(AppConfig.getApiUrl("/api/v1/payments/verify"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.getAuthToken()}`,
      },
      body: JSON.stringify({ reference }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error((error as Record<string, unknown>)?.message as string || "Payment verification failed");
    }

    const json = await response.json();
    return json as PaymentVerifyResponse;
  }
}

export const paystackService = new PaystackService();


