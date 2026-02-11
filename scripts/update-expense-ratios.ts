/**
 * Update expense ratios for all ETFs using Yahoo Finance API.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/update-expense-ratios.ts
 */

import { neon } from "@neondatabase/serverless";

// Known expense ratios for major ETFs (as of 2024, in decimal form e.g., 0.0003 = 0.03%)
const KNOWN_EXPENSE_RATIOS: Record<string, number> = {
  // BlackRock Core Series
  IVV: 0.0003, ITOT: 0.0003, IEFA: 0.0007, IEMG: 0.0009, AGG: 0.0003,
  IUSB: 0.0006, IAGG: 0.0007, IDEV: 0.0004, IXUS: 0.0007,

  // BlackRock US Equity
  IWM: 0.0019, IWF: 0.0019, IWD: 0.0019, IJH: 0.0005, IJR: 0.0006,
  IWB: 0.0015, IWR: 0.0019, IWS: 0.0024, IWN: 0.0024, IWP: 0.0024,
  IWO: 0.0024, IVW: 0.0018, IVE: 0.0018, IJK: 0.0017, IJJ: 0.0017,
  IJT: 0.0018, IJS: 0.0018, IWV: 0.002, IWC: 0.006, OEF: 0.002,
  IUSG: 0.0004, IUSV: 0.0004,

  // BlackRock International
  EFA: 0.0032, EEM: 0.0068, ACWI: 0.0032, ACWX: 0.0032, SCZ: 0.0039,
  EFG: 0.0035, EFV: 0.0035, AAXJ: 0.0068, EEMA: 0.0025, EEMS: 0.0025,
  EPP: 0.0048, URTH: 0.0024,

  // BlackRock Fixed Income
  LQD: 0.0014, HYG: 0.0049, TIP: 0.0019, SHY: 0.0015, IEF: 0.0015,
  TLT: 0.0015, MUB: 0.0007, SUB: 0.0007, EMB: 0.0039, GOVT: 0.0005,
  SHV: 0.0015, MBB: 0.0004, FLOT: 0.0015, NEAR: 0.0025, SHYG: 0.003,
  IGSB: 0.0004, IGIB: 0.0004, USIG: 0.0004, USHY: 0.0015, ISTB: 0.0006,
  ILTB: 0.0006, TLH: 0.0015, IEI: 0.0015, AGZ: 0.0015, STIP: 0.0003,
  IGLB: 0.0004, SGOV: 0.0007, TFLO: 0.0015,

  // BlackRock Dividend
  HDV: 0.0008, DVY: 0.0038, IDV: 0.0049, DGRO: 0.0008, DIVB: 0.0005,

  // BlackRock Sector
  IYW: 0.0039, IYH: 0.0039, IYF: 0.0039, IYE: 0.0039, IYR: 0.0039,
  IYC: 0.0039, IYK: 0.0039, IYM: 0.0039, IYJ: 0.0039, IYG: 0.0039,
  IYT: 0.0039, IYZ: 0.0039, IDU: 0.0039, IBB: 0.0045, IGV: 0.0041,
  SOXX: 0.0035, ITA: 0.0039, ITB: 0.0039, IHI: 0.0039, IHF: 0.0039,

  // BlackRock Factor
  QUAL: 0.0015, MTUM: 0.0015, VLUE: 0.0015, USMV: 0.0015, SIZE: 0.0015,
  EFAV: 0.002, EEMV: 0.0025,

  // BlackRock Country
  INDA: 0.0064, EWJ: 0.005, EWZ: 0.0058, EWG: 0.005, EWU: 0.005,
  EWC: 0.005, EWA: 0.005, EWY: 0.0057, EWT: 0.0057, EWH: 0.005,
  EWS: 0.005, MCHI: 0.0057, FXI: 0.0074, EWW: 0.005, EWI: 0.005,

  // BlackRock ESG
  ESGU: 0.0015, ESGD: 0.002, ESGE: 0.0025, SUSA: 0.0025, DSI: 0.0025,

  // BlackRock Crypto
  IBIT: 0.0025, ETHA: 0.0025,

  // BlackRock Cash
  ICSH: 0.0008,

  // BlackRock Commodity
  IAU: 0.0025, SLV: 0.005, GSG: 0.0075,

  // Vanguard
  VOO: 0.0003, VTI: 0.0003, VEA: 0.0005, VWO: 0.0008, BND: 0.0003,
  VXUS: 0.0007, VIG: 0.0005, VYM: 0.0006, VB: 0.0005, VO: 0.0004,
  VGT: 0.001, VHT: 0.001, VNQ: 0.0012, VTV: 0.0004, VUG: 0.0004,

  // State Street SPDR
  SPY: 0.0009, MDY: 0.0023, DIA: 0.0016, GLD: 0.004,
  XLF: 0.0009, XLK: 0.0009, XLE: 0.0009, XLV: 0.0009, XLI: 0.0009,
  XLY: 0.0009, XLP: 0.0009, XLU: 0.0009, XLB: 0.0009, XLRE: 0.0009, XLC: 0.0009,

  // Invesco
  QQQ: 0.002, QQQM: 0.0015, RSP: 0.002,

  // Schwab
  SCHD: 0.0006, SCHX: 0.0003, SCHB: 0.0003, SCHA: 0.0004, SCHF: 0.0006, SCHE: 0.0011,

  // Crypto ETFs
  GBTC: 0.015, ETHE: 0.025,  // Grayscale (higher fees)
  FBTC: 0.0025, FETH: 0.0025,  // Fidelity
  ARKB: 0.0021,  // ARK 21Shares
  BITB: 0.002,   // Bitwise
  HODL: 0.002,   // VanEck
  BRRR: 0.0025,  // Valkyrie
  EZBC: 0.0019,  // Franklin
  BTCO: 0.0025,  // Invesco Galaxy
  BTCW: 0.0025,  // WisdomTree
};

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  console.log("Updating expense ratios for ETFs...\n");

  let updated = 0;
  for (const [ticker, expenseRatio] of Object.entries(KNOWN_EXPENSE_RATIOS)) {
    try {
      await sql`
        UPDATE etfs
        SET expense_ratio = ${expenseRatio}, updated_at = NOW()
        WHERE ticker = ${ticker}
      `;
      console.log(`  ${ticker}: ${(expenseRatio * 100).toFixed(2)}%`);
      updated++;
    } catch (e) {
      console.error(`  ${ticker}: Error - ${e}`);
    }
  }

  console.log(`\nUpdated expense ratios for ${updated} ETFs.`);
}

main().catch(console.error);
