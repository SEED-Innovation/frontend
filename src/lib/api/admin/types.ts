// Admin court management types
export type DOW =
  | 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export interface CourtLite { 
  id: number; 
  name: string; 
}

export interface AvailabilityRow {
  id: number;
  courtId: number;
  courtName: string;
  dayOfWeek: DOW;
  start: string; // "10:00:00"
  end: string;   // "22:00:00"
}

export interface UnavailabilityRow extends AvailabilityRow {
  reason?: string;
}

export interface SetAvailabilityRequest {
  courtId: number;
  dayOfWeek: DOW;
  start: string;
  end: string;
}

export interface SetUnavailabilityRequest extends SetAvailabilityRequest {
  reason?: string;
}

export interface AvailabilityFilters {
  searchTerm: string;
  dayOfWeek: DOW | 'ALL';
  startTimeAfter?: string;
  endTimeBefore?: string;
}

export interface UnavailabilityFilters extends AvailabilityFilters {}