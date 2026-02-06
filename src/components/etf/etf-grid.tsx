import { EtfCard } from "./etf-card";

interface EtfRow {
  ticker: string;
  name: string;
  price: string | null;
  priceChange1d: string | null;
  aum: string | null;
  expenseRatio: string | null;
  category: string | null;
  issuer: string;
  isBlackrock: boolean | null;
}

export function EtfGrid({ etfs }: { etfs: EtfRow[] }) {
  if (etfs.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg font-medium">No ETFs found</p>
        <p className="text-sm mt-1">Try adjusting your filters or search query.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {etfs.map((etf) => (
        <EtfCard
          key={etf.ticker}
          ticker={etf.ticker}
          name={etf.name}
          price={etf.price != null ? parseFloat(etf.price) : null}
          priceChange1d={
            etf.priceChange1d != null ? parseFloat(etf.priceChange1d) : null
          }
          aum={etf.aum != null ? parseFloat(etf.aum) : null}
          expenseRatio={
            etf.expenseRatio != null ? parseFloat(etf.expenseRatio) : null
          }
          category={etf.category}
          issuer={etf.issuer}
          isBlackrock={etf.isBlackrock ?? false}
        />
      ))}
    </div>
  );
}
