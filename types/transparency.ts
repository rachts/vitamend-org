export interface TransparencyMonth {
  month: string;
  collected: number;
  distributed: number;
  pct: number | null;
}

export interface TransparencyMetrics {
  totalCollected: number;
  totalVerified: number;
  totalRejected: number;
  totalDistributed: number;
  livesImpacted: number | null;
  partnerClinics: number;
  volunteerHours: number | null;
  co2SavedKg: number | null;
  months: TransparencyMonth[];
  lastUpdated: string;
}
