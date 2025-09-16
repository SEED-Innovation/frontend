import { CourtTypeType } from './booking';

export type SportType = 'TENNIS' | 'PADEL';
export type TennisCourtType = 'HARD' | 'CLAY' | 'GRASS';

export interface CourtResponse {
    id: number;
    name: string;
    location: string;
    type: CourtTypeType;
    sportType?: SportType;
    hourlyFee: number;
    hasSeedSystem?: boolean;
    imageUrl?: string;
    amenities?: string[];
    techFeatures?: string[];
    description?: string;
    openingTimes?: string;
    status?: string;
    managerId?: number;
    rating?: number;
    totalRatings?: number;
    distanceInMeters?: number;
    formattedDistance?: string;
    latitude?: number;
    longitude?: number;
}

export interface CourtAvailabilitySlot {
    startTime: string;
    endTime: string;
    isAvailable: boolean;
    price: number;
}