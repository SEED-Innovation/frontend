export interface OpeningTimes {
  weekdays?: string; // e.g., "08:00-22:00"
  weekends?: string; // e.g., "09:00-20:00"
}

export interface Facility {
  id: number;
  name: string;
  location: string;
  description?: string | null;
  titleAr?: string | null;
  descriptionAr?: string | null;
  openingTimes?: OpeningTimes | null;
  latitude?: number | null;
  longitude?: number | null;
  averageRating?: number | null;
  totalRatings?: number | null;
  amenities?: string[];
  techFeatures?: string[];
  imageUrl?: string | null;
  status?: 'ACTIVE' | 'INACTIVE' | 'DELETED';
  managerId?: number | null;
  manager?: { name?: string; email?: string; profilePictureUrl?: string } | null;
  courts?: any[]; // Will be populated with court data when needed
  courtCount?: number;
  // Pricing fields
  hourlyFee?: number;
  discountAmount?: number;
  discountPercentage?: number;
  isPercentageDiscount?: boolean;
  seedRecordingFee?: number;
  // Distance fields for location-based queries
  distanceInMeters?: number;
  formattedDistance?: string;
}

export interface AdminFacilityPageResponse {
  content: Facility[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface CreateFacilityRequest {
  name: string;
  location: string;
  description?: string;
  titleAr?: string;
  descriptionAr?: string;
  openingTimes?: OpeningTimes;
  latitude?: number;
  longitude?: number;
  amenities?: string[];
  techFeatures?: string[];
  imageUrl?: string;
  managerId?: number;
  // Pricing fields
  hourlyFee?: number;
  discountAmount?: number;
  discountPercentage?: number;
  isPercentageDiscount?: boolean;
  seedRecordingFee?: number;
}

export interface UpdateFacilityRequest {
  name?: string;
  location?: string;
  description?: string;
  titleAr?: string;
  descriptionAr?: string;
  openingTimes?: OpeningTimes;
  latitude?: number;
  longitude?: number;
  amenities?: string[];
  techFeatures?: string[];
  imageUrl?: string;
  managerId?: number;
  // Pricing fields
  hourlyFee?: number;
  discountAmount?: number;
  discountPercentage?: number;
  isPercentageDiscount?: boolean;
  seedRecordingFee?: number;
}