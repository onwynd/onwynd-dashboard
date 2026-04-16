
// filepath: lib/api/safeApiCall.ts
import { toast } from "@/components/ui/use-toast";

export async function safeApiCall<T>(
  apiCall: () => Promise<T>,
  suppressErrorToast: boolean = false
): Promise<{ data: any; error: string | null }> {
  try {
    const response = await apiCall();
    // Assuming the actual data is nested in a 'data' property
    const data = (response as any)?.data?.data ?? (response as any)?.data ?? response;
    return { data, error: null };
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "An unexpected error occurred. Please try again.";

    if (!suppressErrorToast) {
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }

    return { data: null, error: errorMessage };
  }
}
