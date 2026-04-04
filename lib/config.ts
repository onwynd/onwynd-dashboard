type PriceMap = Record<string, string>;

function parseJson<T>(value: string | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const stripePriceMap = parseJson<PriceMap>(process.env.NEXT_PUBLIC_STRIPE_PRICE_MAP, {});

function getStripePriceId(planSlug: string): string | undefined {
  return stripePriceMap[planSlug];
}

function getSuccessUrl(defaultPath: string): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}${defaultPath}`;
}

function getApiUrl(path: string): string {
  const normalizedBase = apiUrl.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

export const AppConfig = {
  apiUrl,
  getApiUrl,
  getStripePriceId,
  getSuccessUrl,
};
