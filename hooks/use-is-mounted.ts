export function useIsMounted(): boolean {
  return typeof window !== "undefined";
}
