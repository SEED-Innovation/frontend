import { 
  ReceiptResponse, 
  ReceiptRequest, 
  ReceiptStatistics, 
  ReceiptStatus,
  ReceiptType 
} from '@/types/receipt';

class ReceiptService {
  private baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  private getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // ================================
  // ADMIN RECEIPT APIS
  // ================================

  /**
   * Get all receipts for admin (paginated)
   */
  async getAllReceipts(page = 0, size = 20, status?: ReceiptStatus, type?: ReceiptType): Promise<{
    content: ReceiptResponse[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString()
    });
    
    if (status) params.append('status', status);
    if (type) params.append('type', type);

    const response = await fetch(`${this.baseUrl}/api/admin/receipts/all?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch receipts: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get receipt statistics for admin dashboard
   */
  async getReceiptStatistics(startDate?: string, endDate?: string): Promise<ReceiptStatistics> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await fetch(`${this.baseUrl}/api/admin/receipts/statistics?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch receipt statistics: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Generate receipt for manual booking
   */
  async generateReceiptForManualBooking(
    bookingId: number, 
    type: ReceiptType = ReceiptType.MANUAL_RECEIPT,
    markAsPaid = true,
    sendEmail = true,
    paymentMethod?: string
  ): Promise<ReceiptResponse> {
    const params = new URLSearchParams({
      type: type,
      markAsPaid: markAsPaid.toString(),
      sendEmail: sendEmail.toString()
    });
    
    if (paymentMethod) params.append('paymentMethod', paymentMethod);

    const response = await fetch(`${this.baseUrl}/api/admin/receipts/manual-booking/${bookingId}?${params}`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to generate receipt: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Generate custom receipt
   */
  async generateCustomReceipt(request: ReceiptRequest): Promise<ReceiptResponse> {
    const response = await fetch(`${this.baseUrl}/api/admin/receipts/generate`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to generate custom receipt: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Update receipt status
   */
  async updateReceiptStatus(receiptId: number, newStatus: ReceiptStatus, reason?: string): Promise<ReceiptResponse> {
    const params = new URLSearchParams({
      newStatus: newStatus
    });
    
    if (reason) params.append('reason', reason);

    const response = await fetch(`${this.baseUrl}/api/admin/receipts/${receiptId}/status?${params}`, {
      method: 'PUT',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to update receipt status: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Regenerate receipt PDF
   */
  async regenerateReceipt(receiptId: number): Promise<ReceiptResponse> {
    const response = await fetch(`${this.baseUrl}/api/admin/receipts/${receiptId}/regenerate`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to regenerate receipt: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Download receipt PDF (Admin)
   */
  async downloadReceiptPDF(receiptId: number): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/api/admin/receipts/${receiptId}/download`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to download receipt: ${response.statusText}`);
    }

    return response.blob();
  }

  /**
   * Send receipt email (Admin)
   */
  async sendReceiptEmail(receiptId: number, emailAddress?: string): Promise<{
    receiptId: number;
    receiptNumber: string;
    emailAddress: string;
    sent: boolean;
    sentBy: string;
    message: string;
  }> {
    const params = new URLSearchParams();
    if (emailAddress) params.append('emailAddress', emailAddress);

    const response = await fetch(`${this.baseUrl}/api/admin/receipts/${receiptId}/send-email?${params}`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to send receipt email: ${response.statusText}`);
    }

    return response.json();
  }

  // ================================
  // PLAYER RECEIPT APIS  
  // ================================

  /**
   * Get user's receipts (Player)
   */
  async getMyReceipts(page = 0, size = 20): Promise<{
    content: ReceiptResponse[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString()
    });

    const response = await fetch(`${this.baseUrl}/api/player/receipts/my-receipts?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch my receipts: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Download receipt PDF (Player)
   */
  async downloadMyReceiptPDF(receiptId: number): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/api/player/receipts/${receiptId}/download`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to download receipt: ${response.statusText}`);
    }

    return response.blob();
  }

  /**
   * Email receipt to myself (Player)
   */
  async emailReceiptToMe(receiptId: number): Promise<{
    receiptId: number;
    receiptNumber: string;
    emailAddress: string;
    sent: boolean;
    message: string;
  }> {
    const response = await fetch(`${this.baseUrl}/api/player/receipts/${receiptId}/email-me`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to email receipt: ${response.statusText}`);
    }

    return response.json();
  }

  // ================================
  // UTILITY METHODS
  // ================================

  /**
   * Get receipt by ID
   */
  async getReceiptById(receiptId: number): Promise<ReceiptResponse> {
    // This would need to be implemented on backend
    const response = await fetch(`${this.baseUrl}/api/admin/receipts/${receiptId}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch receipt: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Format receipt amount for display
   */
  formatAmount(amount: number): string {
    return `${amount.toFixed(2)} SAR`;
  }

  /**
   * Get status badge color
   */
  getStatusColor(status: ReceiptStatus): string {
    switch (status) {
      case ReceiptStatus.PAID:
        return 'bg-green-100 text-green-800 border-green-200';
      case ReceiptStatus.GENERATED:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case ReceiptStatus.CANCELLED:
        return 'bg-red-100 text-red-800 border-red-200';
      case ReceiptStatus.DRAFT:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  /**
   * Get type badge color
   */
  getTypeColor(type: ReceiptType): string {
    switch (type) {
      case ReceiptType.BOOKING_RECEIPT:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case ReceiptType.MANUAL_RECEIPT:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case ReceiptType.REFUND_RECEIPT:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case ReceiptType.CANCELLATION_RECEIPT:
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  /**
   * Get printable receipt PDF (for printing/preview)
   */
  async getPrintableReceiptPDF(receiptId: number): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/api/admin/receipts/${receiptId}/print`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get printable receipt: ${response.statusText}`);
    }

    return response.blob();
  }
}

export const receiptService = new ReceiptService();