
import { AdminCourtPageResponse, Court, SportType } from '@/types/court';

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

class CourtService {
    private baseUrl = `${import.meta.env.VITE_API_URL}/admin/courts`;

    private getAuthHeaders() {
        const token = localStorage.getItem('accessToken');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }

    /**
     * Get all courts - role-based filtering happens on backend
     * SUPER_ADMIN sees all courts, ADMIN sees only managed courts
     */
    async getAllCourts(sportType?: SportType): Promise<Court[]> {
        const url = new URL(this.baseUrl);
        if (sportType) {
            url.searchParams.append('sportType', sportType);
        }

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: this.getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch courts: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Get paginated courts - role-based filtering happens on backend
     * SUPER_ADMIN sees all courts, ADMIN sees only managed courts
     */
    async getCourtsPaged(page = 0, size = 50): Promise<AdminCourtPageResponse> {
        const url = new URL(`${this.baseUrl}/paged`);
        url.searchParams.set('page', String(Math.max(0, page)));
        url.searchParams.set('size', String(Math.min(100, Math.max(1, size))));

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: this.getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch paged courts: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Get a specific court by ID
     */
    async getCourtById(courtId: string | number): Promise<Court> {
        const response = await fetch(`${this.baseUrl}/${String(courtId)}`, {
            method: 'GET',
            headers: this.getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch court: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Create a new court (SUPER_ADMIN only) - supports both JSON and multipart with image
     */
    async createCourt(courtData: CreateCourtRequest, file?: File): Promise<Court> {
        const url = `${this.baseUrl}/create`;
        const token = localStorage.getItem('accessToken');

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

            const response = await fetch(url, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: fd
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: response.statusText }));
                // Handle different error response formats
                const errorMessage = error.message || error.errorCode || error.error || `Failed to create court: ${response.statusText}`;
                throw new Error(errorMessage);
            }

            return response.json();
        } else {
            // JSON path without image
            const response = await fetch(url, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(courtData)
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: response.statusText }));
                // Handle different error response formats
                const errorMessage = error.message || error.errorCode || error.error || `Failed to create court: ${response.statusText}`;
                throw new Error(errorMessage);
            }

            return response.json();
        }
    }

    /**
     * Update court details (JSON + multipart support)
     */
    async updateCourt(courtId: string | number, data: UpdateCourtRequest, file?: File): Promise<Court> {
        const url = `${this.baseUrl}/${String(courtId)}`;
        const token = localStorage.getItem('accessToken');

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

            const res = await fetch(url, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` },
                body: fd
            });

            if (!res.ok) {
                const error = await res.json().catch(() => ({ message: res.statusText }));
                // Handle different error response formats
                const errorMessage = error.message || error.errorCode || error.error || `Failed to update court: ${res.statusText}`;
                throw new Error(errorMessage);
            }

            return res.json();
        } else {
            // JSON path
            const res = await fetch(url, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            if (!res.ok) {
                const error = await res.json().catch(() => ({ message: res.statusText }));
                // Handle different error response formats
                const errorMessage = error.message || error.errorCode || error.error || `Failed to update court: ${res.statusText}`;
                throw new Error(errorMessage);
            }

            return res.json();
        }
    }

    /**
     * Delete a court (SUPER_ADMIN only)
     */
    async deleteCourt(courtId: string | number): Promise<void> {
        const response = await fetch(`${this.baseUrl}/${String(courtId)}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`Failed to delete court: ${response.statusText}`);
        }
    }

    /**
     * Update court fee
     */
    async updateCourtFee(courtId: string | number, newHourlyFee: number): Promise<Court> {
        const response = await fetch(`${this.baseUrl}/${String(courtId)}/fee?newHourlyFee=${newHourlyFee}`, {
            method: 'PUT',
            headers: this.getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`Failed to update court fee: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Apply discount to court
     */
    async applyDiscount(courtId: string | number, discountAmount: number, isPercentage: boolean): Promise<Court> {
        const response = await fetch(`${this.baseUrl}/${String(courtId)}/discount?discountAmount=${discountAmount}&isPercentage=${isPercentage}`, {
            method: 'PUT',
            headers: this.getAuthHeaders()
        });

        if (!response.ok) {
            // Try to get specific error message from backend
            let errorMessage = `Failed to apply discount: ${response.statusText}`;
            try {
                const errorData = await response.text();
                if (errorData) {
                    errorMessage = errorData;
                }
            } catch (e) {
                // If parsing fails, check for specific error cases
                if (response.status === 400) {
                    if (isPercentage && discountAmount >= 100) {
                        errorMessage = '100% discount is not allowed. Maximum discount is 99%.';
                    } else if (!isPercentage && discountAmount >= 1000) { // Assuming reasonable upper limit
                        errorMessage = 'Discount amount is too high. Please enter a reasonable amount.';
                    } else {
                        errorMessage = 'Invalid discount amount. Please check your input.';
                    }
                }
            }
            throw new Error(errorMessage);
        }

        return response.json();
    }

    /**
     * Remove discount from court
     */
    async removeDiscount(courtId: string | number): Promise<Court> {
        const response = await fetch(`${this.baseUrl}/${String(courtId)}/discount`, {
            method: 'DELETE',
            headers: this.getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`No discount currently applied to this court: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Get courts for a specific admin
     */
    async getCourtsForAdmin(adminId: string): Promise<Court[]> {
        const response = await fetch(`${this.baseUrl}/admin/${adminId}`, {
            method: 'GET',
            headers: this.getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch admin courts: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Get unassigned courts (SUPER_ADMIN only)
     */
    async getUnassignedCourts(): Promise<Court[]> {
        const response = await fetch(`${this.baseUrl}/unassigned`, {
            method: 'GET',
            headers: this.getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch unassigned courts: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Search courts by name
     */
    async searchCourts(query: string): Promise<Court[]> {
        const url = new URL(`${this.baseUrl}/search`);
        url.searchParams.set('q', query);

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: this.getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`Failed to search courts: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Get court status
     */
    async getCourtStatus(courtId: string | number): Promise<'AVAILABLE' | 'UNAVAILABLE'> {
        const response = await fetch(`${this.baseUrl}/${String(courtId)}/status`, {
            method: 'GET',
            headers: this.getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch court status: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Update court status
     */
    async updateCourtStatus(courtId: string | number, status: 'AVAILABLE' | 'UNAVAILABLE', reason?: string): Promise<Court> {
        const url = new URL(`${this.baseUrl}/${String(courtId)}/status`);
        url.searchParams.append('status', status);
        if (reason) {
            url.searchParams.append('reason', reason);
        }

        const response = await fetch(url.toString(), {
            method: 'PUT',
            headers: this.getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`Failed to update court status: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Set court availability
     */
    async setAvailability(availabilityData: SetCourtAvailabilityRequest): Promise<AdminCourtAvailabilityResponse> {
        const response = await fetch(`${this.baseUrl}/availability/set`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(availabilityData)
        });

        if (!response.ok) {
            // Try to extract error message from backend response
            let errorMessage = `Failed to set court availability: ${response.statusText}`;
            try {
                const errorData = await response.text();
                if (errorData) {
                    // Spring Boot ResponseStatusException returns the message directly
                    errorMessage = errorData;
                }
            } catch (e) {
                // If parsing fails, use the default message
            }
            throw new Error(errorMessage);
        }

        return response.json();
    }

    /**
     * Set court availability for multiple days
     */
    async setBulkAvailability(availabilityData: SetBulkCourtAvailabilityRequest): Promise<AdminCourtAvailabilityResponse[]> {
        const response = await fetch(`${this.baseUrl}/availability/set-bulk`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(availabilityData)
        });

        if (!response.ok) {
            let errorMessage = `Failed to set bulk court availability: ${response.statusText}`;
            try {
                const errorData = await response.text();
                if (errorData) {
                    errorMessage = errorData;
                }
            } catch (e) {
                // If parsing fails, use the default message
            }
            throw new Error(errorMessage);
        }

        return response.json();
    }

    /**
     * Update court availability
     */
    async updateAvailability(id: number, availabilityData: SetCourtAvailabilityRequest): Promise<AdminCourtAvailabilityResponse> {
        const response = await fetch(`${this.baseUrl}/availability/update/${id}`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(availabilityData)
        });

        if (!response.ok) {
            // Try to extract error message from backend response
            let errorMessage = `Failed to update court availability: ${response.statusText}`;
            try {
                const errorData = await response.text();
                if (errorData) {
                    // Spring Boot ResponseStatusException returns the message directly
                    errorMessage = errorData;
                }
            } catch (e) {
                // If parsing fails, use the default message
            }
            throw new Error(errorMessage);
        }

        return response.json();
    }

    /**
     * Delete court availability
     */
    async deleteAvailability(id: number): Promise<void> {
        const response = await fetch(`${this.baseUrl}/availability/delete/${id}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders()
        });

        if (!response.ok) {
            // Try to extract error message from backend response
            let errorMessage = `Failed to delete court availability: ${response.statusText}`;
            try {
                const errorData = await response.text();
                if (errorData) {
                    // Spring Boot ResponseStatusException returns the message directly
                    errorMessage = errorData;
                }
            } catch (e) {
                // If parsing fails, use the default message
            }
            throw new Error(errorMessage);
        }
    }

    /**
     * Get court availabilities (optionally filtered by court)
     */
    async getAvailabilities(courtId?: number): Promise<AdminCourtAvailabilityResponse[]> {
        const url = courtId
            ? `${this.baseUrl}/availability?courtId=${courtId}`
            : `${this.baseUrl}/availability`;

        const response = await fetch(url, {
            method: 'GET',
            headers: this.getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch court availabilities: ${response.statusText}`);
        }

        const rawData = await response.json();

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
        const url = courtId
            ? `${this.baseUrl}/availability/unavailabilities?courtId=${courtId}`
            : `${this.baseUrl}/availability/unavailabilities`;

        const response = await fetch(url, {
            method: 'GET',
            headers: this.getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch court unavailabilities: ${response.statusText}`);
        }

        const rawData = await response.json();

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
        const response = await fetch(`${this.baseUrl}/availability/mark-unavailable`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            // Try to extract error message from backend response
            let errorMessage = `Failed to mark court unavailable: ${response.statusText}`;
            try {
                const errorData = await response.text();
                if (errorData) {
                    errorMessage = errorData;
                }
            } catch (e) {
                // If parsing fails, use the default message
            }
            throw new Error(errorMessage);
        }

        return response.json();
    }

    /**
     * Update court unavailability
     */
    async updateUnavailability(id: number, requestData: UpdateCourtUnavailabilityRequest): Promise<CourtUnavailableResponse> {
        const response = await fetch(`${this.baseUrl}/availability/update-unavailability/${id}`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            // Try to extract error message from backend response
            let errorMessage = `Failed to update unavailability: ${response.statusText}`;
            try {
                const errorData = await response.text();
                if (errorData) {
                    errorMessage = errorData;
                }
            } catch (e) {
                // If parsing fails, use the default message
            }
            throw new Error(errorMessage);
        }

        return response.json();
    }

    /**
     * Delete court unavailability
     */
    async deleteUnavailability(id: number): Promise<void> {
        const response = await fetch(`${this.baseUrl}/availability/delete-unavailability/${id}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders()
        });

        if (!response.ok) {
            // Try to extract error message from backend response
            let errorMessage = `Failed to delete unavailability: ${response.statusText}`;
            try {
                const errorData = await response.text();
                if (errorData) {
                    errorMessage = errorData;
                }
            } catch (e) {
                // If parsing fails, use the default message
            }
            throw new Error(errorMessage);
        }
    }
}

export const courtService = new CourtService();