/** Mirrors the server's `VatRateDto`. */
export interface VatRate {
  id: number;
  rate: number;
  label: string;
  isDefault: boolean;
}
