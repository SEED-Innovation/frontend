
export interface Court {
    id: string;
    name: string;
    location: string;
    type: string;
    hourlyFee: number;
    hasSeedSystem: boolean;
    imageUrl?: string;
    amenities: string[];
    techFeatures?: string[];
    description?: string;
    openingTimes?: {
        weekdays: string;
        weekends: string;
    };
    rating?: number;
    totalRatings?: number;
    latitude?: number;
    longitude?: number;
    status?: 'AVAILABLE' | 'UNAVAILABLE';
    managerId?: number;
    manager?: {
        name: string;
        email: string;
        profilePictureUrl?: string;
    };
    // Discount fields
    discountAmount?: number;
    isPercentage?: boolean;
}

export interface CreateCourtRequest {
    name: string;
    location: string;
    type: string;
    hourlyFee: number;
    hasSeedSystem: boolean;
    amenities: string[];
    imageUrl?: string;
    description?: string;
    latitude?: number;
    longitude?: number;
    manager_id?: { id: number };
}

export interface UpdateCourtRequest {
    name?: string;
    location?: string;
    type?: string;
    hourlyFee?: number;
    hasSeedSystem?: boolean;
    amenities?: string[];
    description?: string;
    latitude?: number;
    longitude?: number;
    imageUrl?: string | null;
    manager_id?: { id: number };
}

export interface SetCourtAvailabilityRequest {
    courtId: number;
    dayOfWeek: string;
    start: string;
    end: string;
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
    async getAllCourts(): Promise<Court[]> {
        const response = await fetch(this.baseUrl, {
            method: 'GET',
            headers: this.getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch courts: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Get a specific court by ID
     */
    async getCourtById(courtId: string): Promise<Court> {
        const response = await fetch(`${this.baseUrl}/${courtId}`, {
            method: 'GET',
            headers: this.getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch court: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Create a new court (SUPER_ADMIN only)
     */
    async createCourt(courtData: CreateCourtRequest): Promise<Court> {
        const response = await fetch(`${this.baseUrl}/create`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(courtData)
        });

        if (!response.ok) {
            throw new Error(`Failed to create court: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Update court details (JSON + multipart support)
     */
    async updateCourt(courtId: string, data: UpdateCourtRequest, file?: File): Promise<Court> {
        const url = `${this.baseUrl}/${courtId}`;
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
            appendIf("hourlyFee", data.hourlyFee);
            appendIf("hasSeedSystem", data.hasSeedSystem);
            appendIf("description", data.description);
            appendIf("latitude", data.latitude);
            appendIf("longitude", data.longitude);

            // Amenities: repeat key
            if (Array.isArray(data.amenities)) {
                data.amenities.forEach(a => fd.append("amenities", a));
            }

            // Manager (SUPER_ADMIN)
            if (data.manager_id?.id != null) {
                fd.append("manager_id.id", String(data.manager_id.id));
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
                throw new Error(error.message || `Failed to update court: ${res.statusText}`);
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
                throw new Error(error.message || `Failed to update court: ${res.statusText}`);
            }
            
            return res.json();
        }
    }

    /**
     * Delete a court (SUPER_ADMIN only)
     */
    async deleteCourt(courtId: string): Promise<void> {
        const response = await fetch(`${this.baseUrl}/${courtId}`, {
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
    async updateCourtFee(courtId: string, newHourlyFee: number): Promise<Court> {
        const response = await fetch(`${this.baseUrl}/${courtId}/fee?newHourlyFee=${newHourlyFee}`, {
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
    async applyDiscount(courtId: string, discountAmount: number, isPercentage: boolean): Promise<Court> {
        const response = await fetch(`${this.baseUrl}/${courtId}/discount?discountAmount=${discountAmount}&isPercentage=${isPercentage}`, {
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
    async removeDiscount(courtId: string): Promise<Court> {
        const response = await fetch(`${this.baseUrl}/${courtId}/discount`, {
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
     * Get court status
     */
    async getCourtStatus(courtId: string): Promise<'AVAILABLE' | 'UNAVAILABLE'> {
        const response = await fetch(`${this.baseUrl}/${courtId}/status`, {
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
    async updateCourtStatus(courtId: string, status: 'AVAILABLE' | 'UNAVAILABLE', reason?: string): Promise<Court> {
        const url = new URL(`${this.baseUrl}/${courtId}/status`);
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
     * Get all court availabilities
     */
    async getAvailabilities(): Promise<AdminCourtAvailabilityResponse[]> {
        const response = await fetch(`${this.baseUrl}/availability`, {
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
     * Get all court unavailabilities
     */
    async getUnavailabilities(): Promise<UnavailabilityRow[]> {
        const response = await fetch(`${this.baseUrl}/availability/unavailabilities`, {
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