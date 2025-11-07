export interface OpeningTimes {
  weekdays?: string; // e.g., "08:00-22:00"
  weekends?: string; // e.g., "09:00-20:00"
}

export interface Facility {
  id: number;
  name: string;
  location: string;
  description?: string | null;
  nameAr?: string | null;
  descriptionAr?: string | null;
  openingTimes?: OpeningTimes | null;
  latitude?: number | null;
  longitude?: number | null;
  locationAndroid?: string | null;
  locationIos?: string | null;
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
  // Required fields (matching backend @NotBlank and @Column(nullable = false))
  name: string;
  location: string;
  hourlyFee: number;
  seedRecordingFee: number;
  
  // Optional fields
  description?: string;
  nameAr?: string;
  descriptionAr?: string;
  openingTimes?: OpeningTimes;
  latitude?: number;
  longitude?: number;
  locationAndroid?: string;
  locationIos?: string;
  amenities?: string[];
  techFeatures?: string[];
  imageUrl?: string;
  managerId?: number;
  
  // Optional pricing fields with defaults
  discountAmount?: number;
  discountPercentage?: number;
  isPercentageDiscount?: boolean;
}

export interface UpdateFacilityRequest {
  name?: string;
  location?: string;
  description?: string;
  nameAr?: string;
  descriptionAr?: string;
  openingTimes?: OpeningTimes;
  latitude?: number;
  longitude?: number;
  locationAndroid?: string;
  locationIos?: string;
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