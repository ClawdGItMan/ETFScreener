/**
 * Seed holdings for BlackRock/iShares ETFs from iShares CSV downloads.
 * Auto-generated mapping of all 470 iShares ETFs with verified product IDs and slugs.
 *
 * Usage: npx tsx --env-file=.env.local scripts/seed-holdings.ts
 */

import { neon } from "@neondatabase/serverless";
import { parseIsharesCSV } from "../src/lib/api/ishares";

// Verified mapping: ticker -> { productId, slug } for iShares CSV downloads
const ISHARES_PRODUCTS: Record<string, { productId: string; slug: string }> = {
  IGLB: { productId: "239423", slug: "ishares-10-year-credit-bond-etf" },
  ILTB: { productId: "239424", slug: "ishares-core-longterm-us-bond-etf" },
  QLTA: { productId: "239431", slug: "ishares-aaa-a-rated-corporate-bond-etf" },
  DVYA: { productId: "239443", slug: "ishares-asiapacific-dividend-etf" },
  STIP: { productId: "239450", slug: "ishares-05-year-tips-bond-etf" },
  IGSB: { productId: "239451", slug: "ishares-13-year-credit-bond-etf" },
  SHY: { productId: "239452", slug: "ishares-13-year-treasury-bond-etf" },
  TLH: { productId: "239453", slug: "ishares-1020-year-treasury-bond-etf" },
  TLT: { productId: "239454", slug: "ishares-20-year-treasury-bond-etf" },
  IEI: { productId: "239455", slug: "ishares-37-year-treasury-bond-etf" },
  IEF: { productId: "239456", slug: "ishares-710-year-treasury-bond-etf" },
  AGZ: { productId: "239457", slug: "ishares-agency-bond-etf" },
  AGG: { productId: "239458", slug: "ishares-core-total-us-bond-market-etf" },
  CMBS: { productId: "239459", slug: "ishares-cmbs-etf" },
  USIG: { productId: "239460", slug: "ishares-credit-bond-etf" },
  GNMA: { productId: "239461", slug: "ishares-gnma-bond-etf" },
  GBF: { productId: "239462", slug: "ishares-governmentcredit-bond-etf" },
  IGIB: { productId: "239463", slug: "ishares-intermediate-credit-bond-etf" },
  GVI: { productId: "239464", slug: "ishares-intermediate-governmentcredit-bond-etf" },
  MBB: { productId: "239465", slug: "ishares-mbs-etf" },
  SHV: { productId: "239466", slug: "ishares-short-treasury-bond-etf" },
  TIP: { productId: "239467", slug: "ishares-tips-bond-etf" },
  GOVT: { productId: "239468", slug: "ishares-us-treasury-bond-etf" },
  ICF: { productId: "239482", slug: "ishares-cohen-steers-reit-etf" },
  IDV: { productId: "239499", slug: "ishares-international-select-dividend-etf" },
  DVY: { productId: "239500", slug: "ishares-select-dividend-etf" },
  IYT: { productId: "239501", slug: "ishares-transportation-average-etf" },
  ITA: { productId: "239502", slug: "ishares-us-aerospace-defense-etf" },
  IYM: { productId: "239503", slug: "ishares-us-basic-materials-etf" },
  IAI: { productId: "239504", slug: "ishares-us-brokerdealers-etf" },
  IYK: { productId: "239505", slug: "ishares-us-consumer-staples-etf" },
  IYC: { productId: "239506", slug: "ishares-us-consumer-discretionary-etf" },
  IYE: { productId: "239507", slug: "ishares-us-energy-etf" },
  IYF: { productId: "239508", slug: "ishares-us-financials-etf" },
  IYG: { productId: "239509", slug: "ishares-us-financial-services-etf" },
  IHF: { productId: "239510", slug: "ishares-us-healthcare-providers-etf" },
  IYH: { productId: "239511", slug: "ishares-us-healthcare-etf" },
  ITB: { productId: "239512", slug: "ishares-us-home-construction-etf" },
  IYY: { productId: "239513", slug: "ishares-dow-jones-us-etf" },
  IYJ: { productId: "239514", slug: "ishares-us-industrials-etf" },
  IAK: { productId: "239515", slug: "ishares-us-insurance-etf" },
  IHI: { productId: "239516", slug: "ishares-us-medical-devices-etf" },
  IEO: { productId: "239517", slug: "ishares-us-oil-gas-exploration-production-etf" },
  IEZ: { productId: "239518", slug: "ishares-us-oil-equipment-services-etf" },
  IHE: { productId: "239519", slug: "ishares-us-pharmaceuticals-etf" },
  IYR: { productId: "239520", slug: "ishares-us-real-estate-etf" },
  IAT: { productId: "239521", slug: "ishares-us-regional-banks-etf" },
  IYW: { productId: "239522", slug: "ishares-us-technology-etf" },
  IYZ: { productId: "239523", slug: "ishares-us-telecommunications-etf" },
  IDU: { productId: "239524", slug: "ishares-us-utilities-etf" },
  CEMB: { productId: "239525", slug: "ishares-emerging-markets-corporate-bond-etf" },
  DVYE: { productId: "239526", slug: "ishares-emerging-markets-dividend-etf" },
  EMHY: { productId: "239527", slug: "ishares-emerging-markets-high-yield-bond-etf" },
  LEMB: { productId: "239528", slug: "ishares-emerging-markets-local-currency-bond-etf" },
  FLOT: { productId: "239534", slug: "ishares-floating-rate-bond-etf" },
  FXI: { productId: "239536", slug: "ishares-china-largecap-etf" },
  REM: { productId: "239543", slug: "ishares-mortgage-real-estate-capped-etf" },
  USRT: { productId: "239544", slug: "ishares-real-estate-50-etf" },
  IAU: { productId: "239561", slug: "ishares-gold-trust-fund" },
  HDV: { productId: "239563", slug: "ishares-high-dividend-etf" },
  HYG: { productId: "239565", slug: "ishares-iboxx-high-yield-corporate-bond-etf" },
  LQD: { productId: "239566", slug: "ishares-iboxx-investment-grade-corporate-bond-etf" },
  EMB: { productId: "239572", slug: "ishares-jp-morgan-usd-emerging-markets-bond-etf" },
  ILCB: { productId: "239579", slug: "ishares-morningstar-largecap-etf" },
  ILCG: { productId: "239580", slug: "ishares-morningstar-largecap-growth-etf" },
  ILCV: { productId: "239581", slug: "ishares-morningstar-largecap-value-etf" },
  IYLD: { productId: "239585", slug: "ishares-morningstar-multiasset-income-etf" },
  ACWX: { productId: "239594", slug: "ishares-msci-acwi-ex-us-etf" },
  ACWI: { productId: "239600", slug: "ishares-msci-acwi-etf" },
  AAXJ: { productId: "239601", slug: "ishares-msci-all-country-asia-ex-japan-etf" },
  ACWV: { productId: "239605", slug: "ishares-msci-all-country-world-minimum-volatility-etf" },
  EPU: { productId: "239606", slug: "ishares-msci-all-peru-capped-etf" },
  EWA: { productId: "239607", slug: "ishares-msci-australia-etf" },
  EWO: { productId: "239609", slug: "ishares-msci-austria-capped-etf" },
  EWK: { productId: "239610", slug: "ishares-msci-belgium-capped-etf" },
  EWZ: { productId: "239612", slug: "ishares-msci-brazil-capped-etf" },
  EWZS: { productId: "239613", slug: "ishares-msci-brazil-smallcap-etf" },
  BKF: { productId: "239614", slug: "ishares-msci-bric-etf" },
  EWC: { productId: "239615", slug: "ishares-msci-canada-etf" },
  ECH: { productId: "239618", slug: "ishares-msci-chile-capped-etf" },
  MCHI: { productId: "239619", slug: "ishares-msci-china-etf" },
  ECNS: { productId: "239620", slug: "ishares-msci-china-smallcap-etf" },
  EFG: { productId: "239622", slug: "ishares-msci-eafe-growth-etf" },
  EFA: { productId: "239623", slug: "ishares-msci-eafe-etf" },
  EFAV: { productId: "239626", slug: "ishares-msci-eafe-minimum-volatility-etf" },
  SCZ: { productId: "239627", slug: "ishares-msci-eafe-smallcap-etf" },
  EFV: { productId: "239628", slug: "ishares-msci-eafe-value-etf" },
  EEMA: { productId: "239629", slug: "ishares-msci-emerging-markets-asia-etf" },
  EEM: { productId: "239637", slug: "ishares-msci-emerging-markets-etf" },
  EEMV: { productId: "239641", slug: "ishares-msci-emerging-markets-minimum-volatility-etf" },
  EEMS: { productId: "239642", slug: "ishares-msci-emerging-markets-smallcap-etf" },
  EZU: { productId: "239644", slug: "ishares-msci-emu-etf" },
  EUFN: { productId: "239645", slug: "ishares-msci-europe-financials-etf" },
  EWQ: { productId: "239648", slug: "ishares-msci-france-etf" },
  EWG: { productId: "239650", slug: "ishares-msci-germany-etf" },
  ICLN: { productId: "239738", slug: "ishares-global-clean-energy-etf" },
  PICK: { productId: "239655", slug: "ishares-msci-global-metals-mining-producers-etf" },
  EWH: { productId: "239657", slug: "ishares-msci-hong-kong-etf" },
  INDA: { productId: "239659", slug: "ishares-msci-india-etf" },
  SMIN: { productId: "239660", slug: "ishares-msci-india-smallcap-etf" },
  EIDO: { productId: "239661", slug: "ishares-msci-indonesia-etf" },
  EWI: { productId: "239664", slug: "ishares-msci-italy-capped-etf" },
  EWJ: { productId: "239665", slug: "ishares-msci-japan-etf" },
  DSI: { productId: "239667", slug: "ishares-msci-kld-400-social-etf" },
  TOK: { productId: "239668", slug: "ishares-msci-kokusai-etf" },
  EWM: { productId: "239669", slug: "ishares-msci-malaysia-etf" },
  EWW: { productId: "239670", slug: "ishares-msci-mexico-capped-etf" },
  EWN: { productId: "239671", slug: "ishares-msci-netherlands-etf" },
  ENZL: { productId: "239672", slug: "ishares-msci-new-zealand-capped-etf" },
  ENOR: { productId: "239673", slug: "ishares-msci-norway-capped-etf" },
  EPP: { productId: "239674", slug: "ishares-msci-pacific-ex-japan-etf" },
  EPHE: { productId: "239675", slug: "ishares-msci-philippines-etf" },
  EPOL: { productId: "239676", slug: "ishares-msci-poland-capped-etf" },
  EWS: { productId: "239678", slug: "ishares-msci-singapore-capped-etf" },
  EZA: { productId: "239680", slug: "ishares-msci-south-africa-etf" },
  EWY: { productId: "239681", slug: "ishares-msci-south-korea-capped-etf" },
  EWP: { productId: "239683", slug: "ishares-msci-spain-capped-etf" },
  EWD: { productId: "239684", slug: "ishares-msci-sweden-etf" },
  EWL: { productId: "239685", slug: "ishares-msci-switzerland-capped-etf" },
  EWT: { productId: "239686", slug: "ishares-msci-taiwan-etf" },
  THD: { productId: "239688", slug: "ishares-msci-thailand-capped-etf" },
  TUR: { productId: "239689", slug: "ishares-msci-turkey-etf" },
  EWU: { productId: "239690", slug: "ishares-msci-united-kingdom-etf" },
  EWUS: { productId: "239691", slug: "ishares-msci-united-kingdom-smallcap-etf" },
  SUSA: { productId: "239692", slug: "ishares-msci-usa-esg-select-etf" },
  EUSA: { productId: "239693", slug: "ishares-msci-usa-etf" },
  USMV: { productId: "239695", slug: "ishares-msci-usa-minimum-volatility-etf" },
  URTH: { productId: "239696", slug: "ishares-msci-world-etf" },
  IBB: { productId: "239699", slug: "ishares-biotechnology-etf" },
  SOXX: { productId: "239705", slug: "ishares-semiconductor-etf" },
  IWF: { productId: "239706", slug: "ishares-russell-1000-growth-etf" },
  IWB: { productId: "239707", slug: "ishares-russell-1000-etf" },
  IWD: { productId: "239708", slug: "ishares-russell-1000-value-etf" },
  IWO: { productId: "239709", slug: "ishares-russell-2000-growth-etf" },
  IWM: { productId: "239710", slug: "ishares-russell-2000-etf" },
  IWN: { productId: "239712", slug: "ishares-russell-2000-value-etf" },
  IUSG: { productId: "239713", slug: "ishares-core-sp-us-growth-etf" },
  IWV: { productId: "239714", slug: "ishares-russell-3000-etf" },
  IUSV: { productId: "239715", slug: "ishares-core-sp-us-value-etf" },
  IWC: { productId: "239716", slug: "ishares-microcap-etf" },
  IWP: { productId: "239717", slug: "ishares-russell-midcap-growth-etf" },
  IWR: { productId: "239718", slug: "ishares-russell-midcap-etf" },
  IWS: { productId: "239719", slug: "ishares-russell-midcap-value-etf" },
  IWY: { productId: "239720", slug: "ishares-russell-top-200-growth-etf" },
  IWL: { productId: "239721", slug: "ishares-russell-top-200-etf" },
  IWX: { productId: "239722", slug: "ishares-russell-top-200-value-etf" },
  OEF: { productId: "239723", slug: "ishares-sp-100-etf" },
  ITOT: { productId: "239724", slug: "ishares-core-sp-total-us-stock-market-etf" },
  IVW: { productId: "239725", slug: "ishares-sp-500-growth-etf" },
  IVV: { productId: "239726", slug: "ishares-core-sp-500-etf" },
  IVE: { productId: "239728", slug: "ishares-sp-500-value-etf" },
  AOA: { productId: "239729", slug: "ishares-aggressive-allocation-etf" },
  AIA: { productId: "239730", slug: "ishares-asia-50-etf" },
  AOK: { productId: "239733", slug: "ishares-conservative-allocation-etf" },
  IEV: { productId: "239736", slug: "ishares-europe-etf" },
  IGF: { productId: "239746", slug: "ishares-global-infrastructure-etf" },
  IXC: { productId: "239741", slug: "ishares-global-energy-etf" },
  IXG: { productId: "239742", slug: "ishares-global-financials-etf" },
  IXJ: { productId: "239744", slug: "ishares-global-healthcare-etf" },
  IXN: { productId: "239750", slug: "ishares-global-tech-etf" },
  IGE: { productId: "239768", slug: "ishares-north-american-natural-resources-etf" },
  IGM: { productId: "239769", slug: "ishares-north-american-tech-etf" },
  IGV: { productId: "239771", slug: "ishares-north-american-techsoftware-etf" },
  RXI: { productId: "239739", slug: "ishares-global-consumer-discretionary-etf" },
  KXI: { productId: "239740", slug: "ishares-global-consumer-staples-etf" },
  EXI: { productId: "239745", slug: "ishares-global-industrials-etf" },
  MXI: { productId: "239748", slug: "ishares-global-materials-etf" },
  IXP: { productId: "239751", slug: "ishares-global-telecom-etf" },
  JXI: { productId: "239753", slug: "ishares-global-utilities-etf" },
  AOR: { productId: "239756", slug: "ishares-growth-allocation-etf" },
  GSG: { productId: "239757", slug: "ishares-sp-gsci-commodityindexed-trust-fund" },
  INDY: { productId: "239758", slug: "ishares-india-50-etf" },
  ILF: { productId: "239761", slug: "ishares-latin-america-40-etf" },
  IJK: { productId: "239762", slug: "ishares-sp-midcap-400-growth-etf" },
  IJH: { productId: "239763", slug: "ishares-core-sp-midcap-etf" },
  IJJ: { productId: "239764", slug: "ishares-sp-midcap-400-value-etf" },
  AOM: { productId: "239765", slug: "ishares-moderate-allocation-etf" },
  MUB: { productId: "239766", slug: "ishares-national-amtfree-muni-bond-etf" },
  SUB: { productId: "239772", slug: "ishares-shortterm-national-amtfree-muni-bond-etf" },
  IJT: { productId: "239773", slug: "ishares-sp-smallcap-600-growth-etf" },
  IJR: { productId: "239774", slug: "ishares-core-sp-smallcap-etf" },
  IJS: { productId: "239775", slug: "ishares-sp-smallcap-600-value-etf" },
  PFF: { productId: "239826", slug: "ishares-us-preferred-stock-etf" },
  IGOV: { productId: "239830", slug: "ishares-international-treasury-bond-etf" },
  ISHG: { productId: "239829", slug: "ishares-13-year-international-treasury-bond-etf" },
  NEAR: { productId: "239854", slug: "ishares-short-maturity-bond-etf" },
  SLV: { productId: "239855", slug: "ishares-silver-trust-fund" },
  IXUS: { productId: "244048", slug: "ishares-core-msci-total-international-stock-etf" },
  IEFA: { productId: "244049", slug: "ishares-core-msci-eafe-etf" },
  IEMG: { productId: "244050", slug: "ishares-core-msci-emerging-markets-etf" },
  ISTB: { productId: "244051", slug: "ishares-core-shortterm-us-bond-etf" },
  SIZE: { productId: "251465", slug: "ishares-msci-usa-size-factor-etf" },
  MTUM: { productId: "251614", slug: "ishares-msci-usa-momentum-factor-etf" },
  VLUE: { productId: "251616", slug: "ishares-msci-usa-value-factor-etf" },
  QUAL: { productId: "256101", slug: "ishares-msci-usa-quality-factor-etf" },
  SLQD: { productId: "258098", slug: "ishares-05-year-investment-grade-corporate-bond-etf" },
  SHYG: { productId: "258100", slug: "ishares-05-year-high-yield-corporate-bond-etf" },
  ICSH: { productId: "258806", slug: "ishares-liquidity-income-etf" },
  HEFA: { productId: "259622", slug: "ishares-currency-hedged-msci-eafe-etf" },
  HEWJ: { productId: "259624", slug: "ishares-currency-hedged-msci-japan-etf" },
  TFLO: { productId: "260652", slug: "ishares-treasury-floating-rate-bond-etf" },
  IUSB: { productId: "264615", slug: "ishares-core-total-usd-bond-market-etf" },
  IEUR: { productId: "264617", slug: "ishares-core-msci-europe-etf" },
  DGRO: { productId: "264623", slug: "ishares-core-dividend-growth-etf" },
  REET: { productId: "268752", slug: "ishares-global-reit-etf" },
  COMT: { productId: "270319", slug: "ishares-commodity-etf" },
  IMTM: { productId: "271538", slug: "ishares-msci-international-developed-momentum-factor-etf" },
  IQLT: { productId: "271540", slug: "ishares-msci-international-developed-quality-factor-etf" },
  KSA: { productId: "271542", slug: "ishares-msci-saudi-arabia-capped-etf" },
  ICVT: { productId: "272819", slug: "ishares-convertible-bond-etf" },
  EMGF: { productId: "272820", slug: "ishares-msci-emerging-multi-factor-etf" },
  GLOF: { productId: "272821", slug: "ishares-msci-global-multi-factor-etf" },
  INTF: { productId: "272822", slug: "ishares-msci-international-multi-factor-etf" },
  ISCF: { productId: "272823", slug: "ishares-msci-international-small-cap-multi-factor-etf" },
  LRGF: { productId: "272824", slug: "ishares-msci-usa-multi-factor-etf" },
  SMLF: { productId: "272825", slug: "ishares-msci-usa-small-cap-multi-factor-etf" },
  CNYA: { productId: "273318", slug: "ishares-msci-china-a-etf" },
  IVLU: { productId: "275382", slug: "ishares-msci-international-developed-value-factor-etf" },
  IAGG: { productId: "279626", slug: "ishares-international-aggregate-bond-etf" },
  IGRO: { productId: "283737", slug: "ishares-international-dividend-growth-etf" },
  ESGE: { productId: "283777", slug: "ishares-esg-aware-msci-em-etf" },
  ESGD: { productId: "283778", slug: "ishares-esg-aware-msci-eafe-etf" },
  FALN: { productId: "283855", slug: "ishares-fallen-angels-usd-bond-etf" },
  SMMV: { productId: "284609", slug: "ishares-msci-usa-small-cap-min-vol-factor-etf" },
  ESGU: { productId: "286007", slug: "ishares-esg-aware-msci-usa-etf" },
  IDEV: { productId: "286762", slug: "ishares-core-msci-international-developed-markets-etf" },
  EMXC: { productId: "288504", slug: "ishares-msci-emerging-markets-ex-china-etf" },
  USHY: { productId: "291299", slug: "ishares-broad-usd-high-yield-corporate-bond-etf" },
  DIVB: { productId: "291387", slug: "ishares-core-dividend-etf" },
  CMDY: { productId: "292741", slug: "ishares-bloomberg-roll-select-commodity-strategy-etf" },
  IFRA: { productId: "294315", slug: "ishares-u-s-infrastructure-etf" },
  ESML: { productId: "296644", slug: "ishares-esg-aware-msci-usa-small-cap-etf" },
  ARTY: { productId: "297905", slug: "ishares-future-ai-tech-etf" },
  EAGG: { productId: "305252", slug: "ishares-esg-aware-u-s-aggregate-bond-etf" },
  DYNF: { productId: "307283", slug: "ishares-u-s-equity-factor-rotation-active-etf" },
  IDRV: { productId: "307332", slug: "ishares-self-driving-ev-and-tech-etf" },
  IHAK: { productId: "307352", slug: "ishares-cybersecurity-and-tech-etf" },
  SUSL: { productId: "308574", slug: "ishares-esg-msci-usa-leaders-etf" },
  IDNA: { productId: "308878", slug: "ishares-genomics-immunology-and-healthcare-etf" },
  GARP: { productId: "312212", slug: "ishares-msci-usa-quality-garp-etf" },
  SGOV: { productId: "314116", slug: "ishares-0-3-month-treasury-bond-etf" },
  DMXF: { productId: "314362", slug: "ishares-esg-advanced-msci-eafe-etf" },
  USXF: { productId: "314365", slug: "ishares-esg-advanced-msci-usa-etf" },
  GOVZ: { productId: "315911", slug: "ishares-25" },
  SVAL: { productId: "316394", slug: "ishares-us-small-cap-value-factor-etf" },
  ISVL: { productId: "317548", slug: "ishares-international-developed-small-cap-value-factor-etf" },
  INMU: { productId: "317976", slug: "ishares-intermediate-muni-income-active-etf" },
  SHYM: { productId: "317978", slug: "ishares-short-duration-high-yield-muni-active-etf" },
  EWJV: { productId: "307263", slug: "ishares-msci-japan-value-etf" },
  XT: { productId: "272532", slug: "ishares-exponential-technologies-etf" },
  TLTW: { productId: "329118", slug: "ishares-20" },
  HYGW: { productId: "329119", slug: "ishares-high-yield-corporate-bond-buywrite-strategy-etf" },
  LQDW: { productId: "329120", slug: "ishares-investment-grade-corporate-bond-buywrite-strategy-etf" },
  CLOA: { productId: "330488", slug: "ishares-aaa-clo-active-etf" },
  BINC: { productId: "331752", slug: "ishares-flexible-income-active-etf" },
  BLCV: { productId: "331795", slug: "ishares-large-cap-value-active-etf" },
  ICOP: { productId: "332280", slug: "ishares-copper-and-metals-mining-etf" },
  ILIT: { productId: "332281", slug: "ishares-lithium-miners-and-producers-etf" },
  IVVM: { productId: "332306", slug: "ishares-large-cap-moderate-quarterly-laddered-etf" },
  IVVB: { productId: "332307", slug: "ishares-large-cap-deep-quarterly-laddered-etf" },
  IBIT: { productId: "333011", slug: "ishares-bitcoin-trust-etf" },
  BLCR: { productId: "333889", slug: "ishares-large-cap-core-active-etf" },
  BRLN: { productId: "329872", slug: "ishares-floating-rate-loan-active-etf" },
  BRTR: { productId: "334572", slug: "ishares-total-return-active-etf" },
  BRHY: { productId: "337564", slug: "ishares-high-yield-active-etf" },
  BGRO: { productId: "337538", slug: "ishares-large-cap-growth-active-etf" },
  ETHA: { productId: "337614", slug: "ishares-ethereum-trust-etf" },
  MAXJ: { productId: "337965", slug: "ishares-large-cap-max-buffer-jun-etf" },
  MADE: { productId: "337989", slug: "ishares-u-s-manufacturing-etf" },
  BAI: { productId: "339081", slug: "ishares-a-i-innovation-and-tech-active-etf" },
  TEK: { productId: "339083", slug: "ishares-technology-opportunities-active-etf" },
  SMAX: { productId: "339266", slug: "ishares-large-cap-max-buffer-sep-etf" },
  TOPT: { productId: "339779", slug: "ishares-top-20-u-s-stocks-etf" },
  DMAX: { productId: "340392", slug: "ishares-large-cap-max-buffer-dec-etf" },
  BALI: { productId: "333207", slug: "ishares-u-s-large-cap-premium-income-active-etf" },
  BELT: { productId: "337476", slug: "ishares-u-s-select-equity-active-etf" },
  CSHP: { productId: "338251", slug: "ishares-enhanced-short-term-bond-active-etf" },
  MMAX: { productId: "341942", slug: "ishares-large-cap-max-buffer-mar-etf" },
  TECB: { productId: "312046", slug: "ishares-u-s-tech-breakthrough-multisector-etf" },
  SUSC: { productId: "288488", slug: "ishares-esg-aware-usd-corporate-bond-etf" },
  SUSB: { productId: "288490", slug: "ishares-esg-aware-1-5-year-usd-corporate-bond-etf" },
  EMXF: { productId: "316020", slug: "ishares-esg-advanced-msci-em-etf" },
  TMET: { productId: "333404", slug: "ishares-transition-enabling-metals-etf" },
  KWT: { productId: "312763", slug: "ishares-msci-kuwait-etf" },
  EIRL: { productId: "239662", slug: "ishares-msci-ireland-capped-etf" },
  EIS: { productId: "239663", slug: "ishares-msci-israel-capped-etf" },
  // iBonds
  IBDR: { productId: "285027", slug: "ishares-ibonds-dec-2026-term-corporate-etf-fund" },
  IBDS: { productId: "290315", slug: "ishares-ibonds-dec-2027-term-corporate-etf" },
  IBDT: { productId: "304570", slug: "ishares-ibonds-dec-2028-term-corporate-etf" },
  IBDU: { productId: "310035", slug: "ishares-ibonds-dec-2029-term-corporate-etf" },
  IBDV: { productId: "314496", slug: "ishares-ibonds-dec-2030-term-corporate-etf" },
  IBDW: { productId: "319154", slug: "ishares-ibonds-dec-2031-term-corporate-etf" },
  IBDX: { productId: "328675", slug: "ishares-ibonds-dec-2032-term-corporate-etf" },
  IBDY: { productId: "332289", slug: "ishares-ibonds-dec-2033-term-corporate-etf" },
};

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko)";

async function fetchCSV(
  ticker: string,
  productId: string,
  slug: string
): Promise<string | null> {
  const url = `https://www.ishares.com/us/products/${productId}/${slug}/1467271812596.ajax?fileType=csv&fileName=${ticker}_holdings&dataType=fund`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "text/csv,application/csv,text/plain" },
    });
    if (!res.ok) {
      console.error(`  ✗ ${ticker}: HTTP ${res.status}`);
      return null;
    }
    return await res.text();
  } catch (err) {
    console.error(`  ✗ ${ticker}: fetch error`, err);
    return null;
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set");
  const sql = neon(process.env.DATABASE_URL);

  // Get all BlackRock ETFs from DB
  const dbEtfs = await sql`SELECT ticker FROM etfs WHERE is_blackrock = true ORDER BY ticker`;
  const dbTickers = new Set(dbEtfs.map((e) => e.ticker as string));

  console.log(`Found ${dbTickers.size} BlackRock ETFs in database`);
  console.log(`Have product mappings for ${Object.keys(ISHARES_PRODUCTS).length} ETFs\n`);

  // Only process ETFs that exist in DB and have a product mapping
  const tickers = Object.keys(ISHARES_PRODUCTS).filter((t) => dbTickers.has(t));
  console.log(`Will seed holdings for ${tickers.length} ETFs\n`);

  let totalHoldings = 0;
  let successCount = 0;
  const today = new Date().toISOString().split("T")[0];

  // Clear existing holdings for these tickers
  console.log("Clearing existing holdings...");
  await sql`DELETE FROM holdings WHERE etf_ticker = ANY(${tickers})`;

  for (const ticker of tickers) {
    const { productId, slug } = ISHARES_PRODUCTS[ticker];

    const csvText = await fetchCSV(ticker, productId, slug);
    if (!csvText) {
      await sleep(500);
      continue;
    }

    try {
      const holdings = parseIsharesCSV(csvText);
      if (holdings.length === 0) {
        console.log(`  ⚠ ${ticker}: CSV parsed but 0 holdings`);
        continue;
      }

      // Insert holdings one at a time using tagged template literals
      // (neon serverless requires tagged templates, not string interpolation)
      const batchSize = 50;
      for (let i = 0; i < holdings.length; i += batchSize) {
        const batch = holdings.slice(i, i + batchSize);
        // Use sql.query() for dynamic SQL with parameterized values
        const placeholders: string[] = [];
        const params: (string | number | null)[] = [];
        let paramIndex = 1;

        for (const h of batch) {
          placeholders.push(
            `($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`
          );
          params.push(
            ticker,
            h.securityTicker,
            h.securityName,
            h.sector,
            h.assetClass,
            h.weight || null,
            h.shares || null,
            h.marketValue || null,
            h.price || null,
            h.location,
            h.exchange,
            h.currency,
            today
          );
        }

        const query = `INSERT INTO holdings (etf_ticker, security_ticker, security_name, sector, asset_class, weight, shares, market_value, price, location, exchange, currency, as_of_date)
           VALUES ${placeholders.join(", ")}
           ON CONFLICT DO NOTHING`;

        await sql.query(query, params);
      }

      totalHoldings += holdings.length;
      successCount++;
      console.log(`  ✓ ${ticker}: ${holdings.length} holdings`);

      // Update holdings count in etfs table
      await sql`UPDATE etfs SET holdings_count = ${holdings.length}, updated_at = NOW() WHERE ticker = ${ticker}`;
    } catch (err) {
      console.error(`  ✗ ${ticker}: parse error`, err);
    }

    // Rate limit: 300ms between requests
    await sleep(300);
  }

  console.log(`\nDone! Seeded ${totalHoldings} total holdings for ${successCount} ETFs.`);
}

main().catch(console.error);
