// filepath: lib/utils/safe-api.ts
import { toast } from "@/components/ui/use-toast";

export async function safeCall<T>(
  fn: () => Promise<T>,
  errorMessage = "Something went wrong. Please try again."
): Promise<T | null> {
  try {
    return await fn();
  } catch (err) {
    console.error(err);
    toast({ title: "Error", description: errorMessage, variant: "destructive" });
    return null;
  }
}
