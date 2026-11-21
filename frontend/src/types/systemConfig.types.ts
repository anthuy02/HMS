export interface SystemConfig {
  id: number;
  depositRatePercent: number;     // 0 < x <= 100, default 30.00%
  serviceFeeRatePercent: number;  // 0 <= x <= 20, default 5.00%
  vatRatePercent: number;         // 0 <= x <= 20, default 10.00%
  updatedAt: string;
}

export interface Holiday {
  monthDay: string; // format "MM-dd" e.g. "01-01"
  name: string;
}

export interface ServiceCatalogItem {
  code: string;
  name: string;
  category: 'MINIBAR' | 'LAUNDRY';
  unitPrice: number;
  active: boolean;
}

export interface Voucher {
  code: string;
  type: 'PERCENT' | 'FIXED';
  value: number;
  maxDiscount?: number;
  minNights: number;
  validFrom: string;
  validTo: string;
}
