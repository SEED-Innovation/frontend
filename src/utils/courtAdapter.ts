import { CourtResponse } from '@/types/court';
import { Court as ExistingCourt } from '@/lib/api/services/courtService';

/**
 * Converts existing Court objects to CourtResponse format
 * @param existingCourts - Array of courts from the existing service
 * @returns Array of courts in CourtResponse format
 */
export const adaptCourts = (existingCourts: ExistingCourt[]): CourtResponse[] => {
    return existingCourts.map((court): CourtResponse => ({
        id: typeof court.id === 'string' ? parseInt(court.id, 10) : court.id,
        name: court.name,
        location: court.location,
        type: court.type as any,
        sportType: court.sportType,
        hourlyFee: court.hourlyFee,
        hasSeedSystem: court.hasSeedSystem ?? false, // ✅ Handle undefined/null values
        imageUrl: court.imageUrl || undefined,
        amenities: court.amenities || [],
        techFeatures: court.techFeatures || [],
        description: court.description || undefined,
        openingTimes: typeof court.openingTimes === 'object' ? JSON.stringify(court.openingTimes) : court.openingTimes || undefined,
        rating: null,
        totalRatings: null,
        distanceInMeters: null,
        formattedDistance: null,
        latitude: null,
        longitude: null
    }));
};

/**
 * Converts a single existing Court to CourtResponse format
 * @param court - Single court from the existing service
 * @returns Court in CourtResponse format
 */
export const adaptCourt = (court: ExistingCourt): CourtResponse => {
    return {
        id: typeof court.id === 'string' ? parseInt(court.id, 10) : court.id,
        name: court.name,
        location: court.location,
        type: court.type as any,
        sportType: court.sportType,
        hourlyFee: court.hourlyFee,
        hasSeedSystem: court.hasSeedSystem ?? false,
        imageUrl: court.imageUrl || undefined,
        amenities: court.amenities || [],
        techFeatures: court.techFeatures || [],
        description: court.description || undefined,
        openingTimes: typeof court.openingTimes === 'object' ? JSON.stringify(court.openingTimes) : court.openingTimes || undefined,
        rating: null,
        totalRatings: null,
        distanceInMeters: null,
        formattedDistance: null,
        latitude: null,
        longitude: null
    };
};