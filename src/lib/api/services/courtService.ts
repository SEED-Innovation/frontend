
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
}

export interface CreateCourtRequest {
    name: string;
    location: string;
    type: string;
    hourlyFee: number;
    hasSeedSystem: boolean;
    amenities: string[];
}

export interface UpdateCourtRequest {
    name?: string;
    location?: string;
    type?: string;
    hourlyFee?: number;
    hasSeedSystem?: boolean;
    amenities?: string[];
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
     * Update court details
     */
    async updateCourt(courtId: string, courtData: UpdateCourtRequest): Promise<Court> {
        const response = await fetch(`${this.baseUrl}/${courtId}`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(courtData)
        });

        if (!response.ok) {
            throw new Error(`Failed to update court: ${response.statusText}`);
        }

        return response.json();
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
            throw new Error(`Failed to apply discount: ${response.statusText}`);
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
            throw new Error(`Failed to remove discount: ${response.statusText}`);
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
}

export const courtService = new CourtService();