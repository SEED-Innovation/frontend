import { PaymentLinkDTO, CreatePaymentLinkRequest } from '@/types/paymentLink';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

class PaymentLinkService {
  private getToken(): string {
    return localStorage.getItem('accessToken') || '';
  }

  private async makeAPICall(url: string, options: RequestInit = {}): Promise<Response> {
    const token = this.getToken();
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response;
  }

  async createPaymentLink(request: CreatePaymentLinkRequest): Promise<PaymentLinkDTO> {
    try {
      console.log('🔗 Creating payment link:', request);
      
      const response = await this.makeAPICall(
        `${API_BASE_URL}/api/admin/payment-links`,
        {
          method: 'POST',
          body: JSON.stringify(request)
        }
      );
      
      const data = await response.json();
      console.log('✅ Payment link created:', data);
      return data;
    } catch (error) {
      console.error('❌ Failed to create payment link:', error);
      throw error;
    }
  }

  async getPaymentLink(linkId: string): Promise<PaymentLinkDTO> {
    try {
      console.log('🔍 Fetching payment link:', linkId);
      
      const response = await this.makeAPICall(
        `${API_BASE_URL}/api/admin/payment-links/${linkId}`
      );
      
      const data = await response.json();
      console.log('✅ Payment link fetched:', data);
      return data;
    } catch (error) {
      console.error('❌ Failed to fetch payment link:', error);
      throw error;
    }
  }

  async getAllPaymentLinks(): Promise<PaymentLinkDTO[]> {
    try {
      console.log('🔍 Fetching all payment links');
      
      const response = await this.makeAPICall(
        `${API_BASE_URL}/api/admin/payment-links`
      );
      
      const data = await response.json();
      console.log('✅ Payment links fetched:', data);
      return data;
    } catch (error) {
      console.error('❌ Failed to fetch payment links:', error);
      throw error;
    }
  }

  generateWhatsAppLink(message: string): string {
    const encodedMessage = encodeURIComponent(message);
    return `whatsapp://send?text=${encodedMessage}`;
  }

  generateWhatsAppWebLink(message: string): string {
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/?text=${encodedMessage}`;
  }

  generateWhatsAppWebLinkWithPhone(phoneNumber: string, message: string): string {
    // Remove any non-digit characters from phone number
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  }

  generateBilingualWhatsAppMessage(paymentLink: PaymentLinkDTO, paymentLinkUrl: string): string {
    const { courtName, facilityName, bookingDate, startTime, endTime, totalAmount } = paymentLink;
    
    // Format date nicely
    const date = new Date(bookingDate);
    const dateStr = date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
    
    // Build bilingual message (English + Arabic)
    const message = `🎾 *SEED Tennis Booking*

Hi! We've reserved a court for you:

📍 *Facility:* ${facilityName}
🏟️ *Court:* ${courtName}
📅 *Date:* ${dateStr}
⏰ *Time:* ${startTime} - ${endTime}
💰 *Price:* ${totalAmount} SAR

Please complete your payment to confirm:
${paymentLinkUrl}

───────────────

🎾 *حجز ملاعب سيد*

مرحباً! حجزنا لك ملعب:

📍 *المنشأة:* ${facilityName}
🏟️ *الملعب:* ${courtName}
📅 *التاريخ:* ${dateStr}
⏰ *الوقت:* ${startTime} - ${endTime}
💰 *السعر:* ${totalAmount} ريال

يرجى إتمام الدفع لتأكيد الحجز:
${paymentLinkUrl}`;

    return message;
  }
}

export const paymentLinkService = new PaymentLinkService();
