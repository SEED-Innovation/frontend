export type SportType = 'TENNIS' | 'PADEL';
export type CourtType = 'HARD' | 'CLAY' | 'GRASS' | 'CARPET' | 'ACRYLIC' | 'PADEL' | null;

export interface Court {
  id: number;                 // unify id type (number)
  name: string;
  facilityId?: number | null; // Reference to facility
  facilityName?: string | null; // For convenience
  location?: string | null;   // From facility
  sportType: SportType;
  type: CourtType;            // null for PADEL
  // hourlyFee moved to facility level
  facility?: {
    id: number;
    name: string;
    hourlyFee: number;
    seedRecordingFee?: number;
    location?: string;
  } | null;
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
  rating?: number;           // From facility
  totalRatings?: number;     // From facility
  distanceInMeters?: number; // From facility
  formattedDistance?: string; // From facility
  latitude?: number;         // From facility
  longitude?: number;        // From facility
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