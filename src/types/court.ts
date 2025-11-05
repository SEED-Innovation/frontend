export type SportType = 'TENNIS' | 'PADEL';
export type CourtType = 'HARD' | 'CLAY' | 'GRASS' | 'CARPET' | 'ACRYLIC' | 'PADEL' | null;

export interface Court {
  id: number;                 // unify id type (number)
  name: string;
  location?: string | null;
  sportType: SportType;
  type: CourtType;            // null for PADEL
  hourlyFee?: number | null;
  hasSeedSystem?: boolean;
  imageUrl?: string | null;
  amenities?: string[];
  techFeatures?: string[];
  description?: string | null;
  titleAr?: string | null;
  descriptionAr?: string | null;
  managerId?: number | null;
  manager?: { name?: string; email?: string; profilePictureUrl?: string } | null; // present for SUPER_ADMIN
  status?: 'AVAILABLE' | 'UNAVAILABLE';
  // Legacy fields for backward compatibility
  openingTimes?: string;
  rating?: number;
  totalRatings?: number;
  distanceInMeters?: number;
  formattedDistance?: string;
  latitude?: number;
  longitude?: number;
  // Discount fields
  discountAmount?: number;
  isPercentage?: boolean;
}

export interface AdminCourtPageResponse {
  courts: Court[];
  totalElements: number; // long on BE, number here
  totalPages: number;
  currentPage: number;   // 0-based
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Legacy alias for backward compatibility
export interface CourtResponse extends Court {}

export interface CourtAvailabilitySlot {
    startTime: string;
    endTime: string;
    isAvailable: boolean;
    price: number;
}