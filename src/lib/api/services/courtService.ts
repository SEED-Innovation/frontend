
import { AdminCourtPageResponse, Court, SportType } from '@/types/court';
import { apiClient } from '../client';

export interface CreateCourtRequest {
    name: string;
    location: string;
    type: string | null;
    sportType?: SportType;
    hourlyFee: number;
    hasSeedSystem: boolean;
    amenities: string[];
    imageUrl?: string;
    description?: string;
    titleAr?: string;
    descriptionAr?: string;
    latitude?: number;
    longitude?: number;
    manager_id?: number | null;
}

export interface UpdateCourtRequest {
    name?: string;
    location?: string;
    type?: string | null;
    sportType?: SportType;
    hourlyFee?: number;
    hasSeedSystem?: boolean;
    amenities?: string[];
    description?: string;
    titleAr?: string;
    descriptionAr?: string;
    latitude?: number;
    longitude?: number;
    imageUrl?: string | null;
    manager_id?: number | null;
}

export interface SetCourtAvailabilityRequest {
    courtId: number;
    dayOfWeek: string;
    start: string;
    end: string;
    startDate?: string; // Optional: YYYY-MM-DD format for date-specific availability
    endDate?: string;   // Optional: YYYY-MM-DD format for date range availability
}

export interface SetBulkCourtAvailabilityRequest {
    courtId: number;
    daysOfWeek: string[];
    start: string;
    end: string;
    startDate?: string; // Optional: YYYY-MM-DD format for date-specific availability
    endDate?: string;   // Optional: YYYY-MM-DD format for date range availability
}

export interface AdminCourtAvailabilityResponse {
    id: number;
    courtId: number;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    isActive: boolean;
    courtName?: string; // Added to support backend response
}

export interface UnavailabilityResponse {
    courtName: string;
    date: string; // Format: "dd-MM-yyyy"
}

export interface UnavailabilityRow {
    id: number;
    courtId: number;
    courtName: string;
    date: string; // Format: "dd-MM-yyyy"
}

export interface MarkUnavailableRequest {
    courtId: number;
    date: string; // Format: "YYYY-MM-DD"
}

export interface CourtUnavailableResponse {
    id: number;
    courtId: number;
    date: string;
    reason?: string;
}

export interface UpdateCourtUnavailabilityRequest {
    courtId: number;
    date: string; // Format: "YYYY-MM-DD"
}

export interface CourtAvailabilityRequest {
    courtId: number;
    date: string; // Format: "YYYY-MM-DD"
    durationMinutes: number;
}

export interface CourtAvailabilityResponse {
    availableSlots: Array<{
        startTime: string;
        endTime: string;
        available: boolean;
    }>;
    totalAvailableSlots: number;
}

class CourtService {
    private baseUrl = '/admin/courts';

    /**
     * Get all courts - role-based filtering happens on backend
     * SUPER_ADMIN sees all courts, ADMIN sees only managed courts
     */
    async getAllCourts(sportType?: SportType): Promise<Court[]> {
        const params = new URLSearchParams();
        if (sportType) {
            params.append('sportType', sportType);
        }
        
        const endpoint = params.toString() ? `${this.baseUrl}?${params}` : this.baseUrl;
        return apiClient.get<Court[]>(endpoint);
    }

    /**
     * Get paginated courts - role-based filtering happens on backend
     * SUPER_ADMIN sees all courts, ADMIN sees only managed courts
     */
    async getCourtsPaged(page = 0, size = 50): Promise<AdminCourtPageResponse> {
        const params = new URLSearchParams();
        params.set('page', String(Math.max(0, page)));
        params.set('size', String(Math.min(100, Math.max(1, size))));

        return apiClient.get<AdminCourtPageResponse>(`${this.baseUrl}/paged?${params}`);
    }

    /**
     * Get a specific court by ID
     */
    async getCourtById(courtId: string | number): Promise<Court> {
        return apiClient.get<Court>(`${this.baseUrl}/${String(courtId)}`);
    }

    /**
     * Create a new court (SUPER_ADMIN only) - supports both JSON and multipart with image
     */
    async createCourt(courtData: CreateCourtRequest, file?: File): Promise<Court> {
        const endpoint = `${this.baseUrl}/create`;

        if (file) {
            // Multipart path with image
            const fd = new FormData();

            // Append scalar fields
            const appendIf = (k: string, v: any) => {
                if (v === undefined || v === null) return;
                fd.append(k, String(v));
            };

            appendIf("name", courtData.name);
            appendIf("location", courtData.location);
            appendIf("type", courtData.type);
            appendIf("sportType", courtData.sportType);
            appendIf("hourlyFee", courtData.hourlyFee);
            appendIf("hasSeedSystem", courtData.hasSeedSystem);
            appendIf("description", courtData.description);
            appendIf("latitude", courtData.latitude);
            appendIf("longitude", courtData.longitude);

            // Amenities: repeat key for array
            if (Array.isArray(courtData.amenities)) {
                courtData.amenities.forEach(a => fd.append("amenities", a));
            }

            // Manager ID
            if (courtData.manager_id != null) {
                fd.append("manager_id", String(courtData.manager_id));
            }

            // File part must be "image"
            fd.append("image", file);

            return apiClient.postFormData<Court>(endpoint, fd);
        } else {
            // JSON path without image
            return apiClient.post<Court>(endpoint, courtData);
        }
    }

    /**
     * Update court details (JSON + multipart support)
     */
    async updateCourt(courtId: string | number, data: UpdateCourtRequest, file?: File): Promise<Court> {
        const endpoint = `${this.baseUrl}/${String(courtId)}`;

        if (file) {
            // Multipart path
            const fd = new FormData();

            // Append scalar fields if defined
            const appendIf = (k: string, v: any) => {
                if (v === undefined || v === null) return;
                fd.append(k, String(v));
            };

            appendIf("name", data.name);
            appendIf("location", data.location);
            appendIf("type", data.type);
            appendIf("sportType", data.sportType);
            appendIf("hourlyFee", data.hourlyFee);
            appendIf("hasSeedSystem", data.hasSeedSystem);
            appendIf("description", data.description);
            appendIf("latitude", data.latitude);
            appendIf("longitude", data.longitude);

            // Amenities: repeat key
            if (Array.isArray(data.amenities)) {
                data.amenities.forEach(a => fd.append("amenities", a));
            }

            // Manager (SUPER_ADMIN) - explicitly handle null to remove manager
            if (data.manager_id !== undefined) {
                fd.append("manager_id", data.manager_id === null ? "0" : String(data.manager_id));
            }

            // File part must be "image"
            fd.append("image", file);

            return apiClient.putFormData<Court>(endpoint, fd);
        } else {
            // JSON path
            return apiClient.put<Court>(endpoint, data);
        }
    }

    /**
     * Delete a court (SUPER_ADMIN only)
     */
    async deleteCourt(courtId: string | number): Promise<void> {
        return apiClient.delete<void>(`${this.baseUrl}/${String(courtId)}`);
    }

    /**
     * Update court fee
     */
    async updateCourtFee(courtId: string | number, newHourlyFee: number): Promise<Court> {
        return apiClient.put<Court>(`${this.baseUrl}/${String(courtId)}/fee?newHourlyFee=${newHourlyFee}`);
    }

    /**
     * Apply discount to court
     */
    async applyDiscount(courtId: string | number, discountAmount: number, isPercentage: boolean): Promise<Court> {
        try {
            return await apiClient.put<Court>(`${this.baseUrl}/${String(courtId)}/discount?discountAmount=${discountAmount}&isPercentage=${isPercentage}`);
        } catch (error: any) {
            // Handle specific error cases for better UX
            if (error.status === 400) {
                if (isPercentage && discountAmount >= 100) {
                    throw new Error('100% discount is not allowed. Maximum discount is 99%.');
                } else if (!isPercentage && discountAmount >= 1000) {
                    throw new Error('Discount amount is too high. Please enter a reasonable amount.');
                } else {
                    throw new Error('Invalid discount amount. Please check your input.');
                }
            }
            throw error;
        }
    }

    /**
     * Remove discount from court
     */
    async removeDiscount(courtId: string | number): Promise<Court> {
        return apiClient.delete<Court>(`${this.baseUrl}/${String(courtId)}/discount`);
    }

    /**
     * Get courts for a specific admin
     */
    async getCourtsForAdmin(adminId: string): Promise<Court[]> {
        return apiClient.get<Court[]>(`${this.baseUrl}/admin/${adminId}`);
    }

    /**
     * Get unassigned courts (SUPER_ADMIN only)
     */
    async getUnassignedCourts(): Promise<Court[]> {
        return apiClient.get<Court[]>(`${this.baseUrl}/unassigned`);
    }

    /**
     * Search courts by name
     */
    async searchCourts(query: string): Promise<Court[]> {
        const params = new URLSearchParams();
        params.set('q', query);
        return apiClient.get<Court[]>(`${this.baseUrl}/search?${params}`);
    }

    /**
     * Get court status
     */
    async getCourtStatus(courtId: string | number): Promise<'AVAILABLE' | 'UNAVAILABLE'> {
        return apiClient.get<'AVAILABLE' | 'UNAVAILABLE'>(`${this.baseUrl}/${String(courtId)}/status`);
    }

    /**
     * Update court status
     */
    async updateCourtStatus(courtId: string | number, status: 'AVAILABLE' | 'UNAVAILABLE', reason?: string): Promise<Court> {
        const params = new URLSearchParams();
        params.append('status', status);
        if (reason) {
            params.append('reason', reason);
        }
        return apiClient.put<Court>(`${this.baseUrl}/${String(courtId)}/status?${params}`);
    }

    /**
     * Set court availability
     */
    async setAvailability(availabilityData: SetCourtAvailabilityRequest): Promise<AdminCourtAvailabilityResponse> {
        return apiClient.post<AdminCourtAvailabilityResponse>(`${this.baseUrl}/availability/set`, availabilityData);
    }

    /**
     * Set court availability for multiple days
     */
    async setBulkAvailability(availabilityData: SetBulkCourtAvailabilityRequest): Promise<AdminCourtAvailabilityResponse[]> {
        return apiClient.post<AdminCourtAvailabilityResponse[]>(`${this.baseUrl}/availability/set-bulk`, availabilityData);
    }

    /**
     * Update court availability
     */
    async updateAvailability(id: number, availabilityData: SetCourtAvailabilityRequest): Promise<AdminCourtAvailabilityResponse> {
        return apiClient.put<AdminCourtAvailabilityResponse>(`${this.baseUrl}/availability/update/${id}`, availabilityData);
    }

    /**
     * Delete court availability
     */
    async deleteAvailability(id: number): Promise<void> {
        return apiClient.delete<void>(`${this.baseUrl}/availability/delete/${id}`);
    }

    /**
     * Get court availabilities (optionally filtered by court)
     */
    async getAvailabilities(courtId?: number): Promise<AdminCourtAvailabilityResponse[]> {
        const endpoint = courtId
            ? `${this.baseUrl}/availability?courtId=${courtId}`
            : `${this.baseUrl}/availability`;

        const rawData = await apiClient.get<any[]>(endpoint);

        // Backend now returns real IDs - use them for edit/delete operations
        return rawData.map((item: any) => ({
            id: parseInt(item.id), // Use real database ID from backend
            courtId: item.courtId || 0, // Use real court ID if available
            dayOfWeek: item.dayOfWeek.toUpperCase(), // Ensure uppercase format
            startTime: item.start + ':00', // Convert "HH:mm" to "HH:mm:ss" format
            endTime: item.end + ':00',
            isActive: true,
            courtName: item.courtName
        }));
    }

    /**
     * Get court unavailabilities (optionally filtered by court)
     */
    async getUnavailabilities(courtId?: number): Promise<UnavailabilityRow[]> {
        const endpoint = courtId
            ? `${this.baseUrl}/availability/unavailabilities?courtId=${courtId}`
            : `${this.baseUrl}/availability/unavailabilities`;

        const rawData = await apiClient.get<any[]>(endpoint);

        // Transform the backend response to match UnavailabilityRow interface
        return rawData.map((item: any) => ({
            id: item.id,              // Use real database ID from backend
            courtId: item.courtId,    // Use real court ID from backend
            courtName: item.courtName,
            date: item.date           // Display date format
        }));
    }

    /**
     * Mark a court as unavailable for a specific date
     */
    async markUnavailable(requestData: MarkUnavailableRequest): Promise<CourtUnavailableResponse> {
        return apiClient.post<CourtUnavailableResponse>(`${this.baseUrl}/availability/mark-unavailable`, requestData);
    }

    /**
     * Update court unavailability
     */
    async updateUnavailability(id: number, requestData: UpdateCourtUnavailabilityRequest): Promise<CourtUnavailableResponse> {
        return apiClient.put<CourtUnavailableResponse>(`${this.baseUrl}/availability/update-unavailability/${id}`, requestData);
    }

    /**
     * Delete court unavailability
     */
    async deleteUnavailability(id: number): Promise<void> {
        return apiClient.delete<void>(`${this.baseUrl}/availability/delete-unavailability/${id}`);
    }

    /**
     * Check court availability for booking (requires authentication)
     */
    async checkAvailability(requestData: CourtAvailabilityRequest): Promise<CourtAvailabilityResponse> {
        return apiClient.post<CourtAvailabilityResponse>('/courts/availability', requestData);
    }
}

export const courtService = new CourtService();