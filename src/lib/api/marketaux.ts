import type { MarketauxArticle } from "@/types/api";

const MARKETAUX_BASE = "https://api.marketaux.com/v1";
const apiToken = () => process.env.MARKETAUX_API_KEY || "";

interface MarketauxResponse {
  data: MarketauxArticle[];
  meta: {
    found: number;
    returned: number;
    limit: number;
    page: number;
  };
}

const EMPTY_RESPONSE: MarketauxResponse = {
  data: [],
  meta: { found: 0, returned: 0, limit: 0, page: 1 },
};

export async function fetchNews(options: {
  symbols?: string[];
  filter_entities?: boolean;
  sentiment?: string;
  page?: number;
  limit?: number;
}): Promise<MarketauxResponse> {
  if (!apiToken()) return EMPTY_RESPONSE;

  const url = new URL(`${MARKETAUX_BASE}/news/all`);
  url.searchParams.set("api_token", apiToken());
  url.searchParams.set("language", "en");
  url.searchParams.set("limit", String(options.limit || 10));
  url.searchParams.set("page", String(options.page || 1));

  if (options.symbols?.length) {
    url.searchParams.set("symbols", options.symbols.join(","));
  }
  if (options.filter_entities) {
    url.searchParams.set("filter_entities", "true");
  }
  if (options.sentiment) {
    url.searchParams.set("sentiment", options.sentiment);
  }

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 1800 } });
    if (!res.ok) {
      console.error(`Marketaux API error: ${res.status} ${res.statusText}`);
      return EMPTY_RESPONSE;
    }
    return res.json();
  } catch (err) {
    console.error("Marketaux fetch error:", err);
    return EMPTY_RESPONSE;
  }
}

export async function fetchNewsBySector(
  sector: string
): Promise<MarketauxResponse> {
  if (!apiToken()) return EMPTY_RESPONSE;

  const url = new URL(`${MARKETAUX_BASE}/news/all`);
  url.searchParams.set("api_token", apiToken());
  url.searchParams.set("language", "en");
  url.searchParams.set("industries", sector);
  url.searchParams.set("limit", "10");

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 1800 } });
    if (!res.ok) {
      console.error(`Marketaux sector news error: ${res.status}`);
      return EMPTY_RESPONSE;
    }
    return res.json();
  } catch (err) {
    console.error("Marketaux sector fetch error:", err);
    return EMPTY_RESPONSE;
  }
}
