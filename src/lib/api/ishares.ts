import type { Holding } from "@/types/etf";

interface IsharesHolding {
  securityTicker: string | null;
  securityName: string;
  sector: string | null;
  assetClass: string | null;
  weight: number;
  shares: number;
  marketValue: number;
  price: number;
  location: string | null;
  exchange: string | null;
  currency: string | null;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

export function parseIsharesCSV(csvText: string): IsharesHolding[] {
  const lines = csvText.split("\n");

  // Find the header row containing column names
  let headerIndex = -1;
  for (let i = 0; i < Math.min(lines.length, 20); i++) {
    const lower = lines[i].toLowerCase();
    if (
      (lower.includes("ticker") || lower.includes("name")) &&
      lower.includes("weight")
    ) {
      headerIndex = i;
      break;
    }
  }

  if (headerIndex === -1) {
    throw new Error("Could not find header row in iShares CSV");
  }

  const headers = parseCSVLine(lines[headerIndex]).map((h) =>
    h.trim().toLowerCase()
  );
  const holdings: IsharesHolding[] = [];

  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    if (values.length < headers.length) continue;

    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx]?.trim() || "";
    });

    const name = row["name"] || row["security name"] || "";
    if (!name) continue;

    holdings.push({
      securityTicker:
        row["ticker"] || row["symbol"] || row["security ticker"] || null,
      securityName: name,
      sector: row["sector"] || null,
      assetClass: row["asset class"] || null,
      weight: parseFloat(row["weight (%)"] || row["weight"] || "0") || 0,
      shares:
        parseFloat(
          (row["shares"] || row["par value"] || "0").replace(/,/g, "")
        ) || 0,
      marketValue:
        parseFloat(
          (row["market value"] || row["notional value"] || "0").replace(
            /,/g,
            ""
          )
        ) || 0,
      price: parseFloat((row["price"] || "0").replace(/,/g, "")) || 0,
      location: row["location"] || row["country"] || null,
      exchange: row["exchange"] || null,
      currency: row["currency"] || null,
    });
  }

  return holdings;
}

export async function fetchIsharesHoldings(
  ticker: string,
  productId: string,
  slug?: string
): Promise<IsharesHolding[]> {
  // iShares CSV download URL pattern - requires full slug in URL
  const slugPart = slug || "ishares-etf";
  const url = `https://www.ishares.com/us/products/${productId}/${slugPart}/1467271812596.ajax?fileType=csv&fileName=${ticker}_holdings&dataType=fund`;

  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      Accept: "text/csv,application/csv,text/plain",
    },
  });

  if (!res.ok) {
    throw new Error(
      `iShares CSV fetch failed for ${ticker}: ${res.status}`
    );
  }

  const csvText = await res.text();
  return parseIsharesCSV(csvText);
}
