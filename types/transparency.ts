export interface TransparencyMonth {
  month: string;
  collected: number;
  distributed: number;
  pct: number;
}

export interface TransparencyMetrics {
  totalCollected: number;
  totalVerified: number;
  totalRejected: number;
  totalDistributed: number;
  livesImpacted: number;
  partnerClinics: number;
  volunteerHours: number;
  co2SavedKg: number;
  months: TransparencyMonth[];
  lastUpdated: string;
}
