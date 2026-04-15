import client from "@/lib/api/client";

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
  async initializePayment(params: PaystackPaymentParams): Promise<string> {
    const response = params.planUuid
      ? await client.post("/api/v1/payments/subscription/initialize", {
          plan_uuid: params.planUuid,
          currency: "NGN",
        })
      : await client.post("/api/v1/payments/initialize", {
          amount: Math.round(params.amount * 100),
          email: params.email,
        });

    const data: PaymentInitResponse = response?.data?.data ?? response?.data ?? {};
    const url = data.authorization_url;
    if (!url) throw new Error("Invalid response from payment gateway");
    return url;
  }

  async verifyPayment(reference: string): Promise<PaymentVerifyResponse> {
    const response = await client.post(`/api/v1/payments/verify/${encodeURIComponent(reference)}`);
    return (response?.data ?? {}) as PaymentVerifyResponse;
  }
}

export const paystackService = new PaystackService();


