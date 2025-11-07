// Admin court management types
export type DOW =
  | 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export interface CourtLite { 
  id: number; 
  name: string; 
  imageUrl?: string;
}

export interface AvailabilityRow {
  id: number;
  courtId: number;
  courtName: string;
  courtImageUrl?: string;
  facilityName?: string;
  dayOfWeek: DOW;
  start: string; // "10:00:00"
  end: string;   // "22:00:00"
}

export interface UnavailabilityRow {
  id: number;
  courtId: number;
  courtName: string;
  courtImageUrl?: string;
  facilityName?: string;
  date: string; // "2025-08-22"
}

export interface SetAvailabilityRequest {
  courtId: number;
  dayOfWeek: DOW;
  start: string;
  end: string;
}

export interface SetUnavailabilityRequest {
  courtId: number;
  date: string; // "2025-08-22"
}

export interface AvailabilityFilters {
  searchTerm: string;
  dayOfWeek: DOW | 'ALL';
  facilityName?: string;
  startTimeAfter?: string;
  endTimeBefore?: string;
}

export interface UnavailabilityFilters {
  searchTerm: string;
  dayOfWeek: DOW | 'ALL';
  facilityName?: string;
  startTimeAfter?: string;
  endTimeBefore?: string;
}