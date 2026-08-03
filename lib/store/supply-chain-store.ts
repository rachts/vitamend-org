import { create } from 'zustand';

export type EventType = 
  | "DONATION_CREATED" 
  | "OCR_COMPLETED" 
  | "VERIFICATION_PENDING" 
  | "PHARMACIST_APPROVED" 
  | "INVENTORY_UPDATED"
  | "ROUTED_TO_CLINIC" 
  | "DELIVERED";

export interface SupplyChainEvent {
  id: string;
  type: EventType;
  title: string;
  description: string;
  medicineName?: string;
  sourceCity?: string;
  sourceCoords?: [number, number]; // [lat, lng]
  destCity?: string;
  destCoords?: [number, number];
  timestamp: number;
  confidence?: number;
}

export interface ArcData {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: string | string[];
}

interface SupplyChainState {
  events: SupplyChainEvent[];
  activeArcs: ArcData[];
  stats: {
    medicinesSaved: number;
    familiesHelped: number;
    clinicsConnected: number;
    carbonPrevented: number;
  };
  isDemoMode: boolean;
  addEvent: (event: SupplyChainEvent) => void;
  addArc: (arc: ArcData) => void;
  clearArcs: () => void;
  incrementStat: (stat: keyof SupplyChainState['stats'], amount?: number) => void;
  setDemoMode: (active: boolean) => void;
}

export const useSupplyChainStore = create<SupplyChainState>((set) => ({
  events: [],
  activeArcs: [],
  stats: {
    medicinesSaved: 12450,
    familiesHelped: 8300,
    clinicsConnected: 45,
    carbonPrevented: 2450,
  },
  isDemoMode: false,
  addEvent: (event) => set((state) => {
    // Prevent duplicate events (useful for polling)
    if (state.events.some(e => e.id === event.id)) return state;
    return {
      events: [event, ...state.events].slice(0, 50) // keep last 50 events
    };
  }),
  addArc: (arc) => set((state) => ({
    activeArcs: [...state.activeArcs, arc]
  })),
  clearArcs: () => set({ activeArcs: [] }),
  incrementStat: (stat, amount = 1) => set((state) => ({
    stats: {
      ...state.stats,
      [stat]: state.stats[stat] + amount
    }
  })),
  setDemoMode: (active) => set({ isDemoMode: active })
}));
