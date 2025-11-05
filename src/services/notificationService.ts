import { apiClient } from '@/lib/api/client';

export interface PromotionalNotificationRequest {
  title: string;
  body: string;
  targetType: 'ALL' | 'BY_LANGUAGE' | 'SPECIFIC_USERS';
  language: string;
  targetLanguage?: string;
  targetUserIds?: string[];
  customData?: { [key: string]: any };
  scheduledAt?: string;
}

export interface TestPromotionalNotificationRequest {
  title: string;
  body: string;
  language: string;
}

export interface PromotionalNotificationResponse {
  title: string;
  body: string;
  language: string;
  targetType: string;
  totalUsers: number;
  successCount: number;
  failureCount: number;
}

export interface NotificationStats {
  totalActiveDevices: number;
  devicesByLanguage: { [key: string]: number };
  devicesByPlatform: { [key: string]: number };
  timestamp: string;
}

export const notificationService = {
  /**
   * Get promotional notification statistics
   */
  async getPromotionalStats(): Promise<{ data: NotificationStats }> {
    const response = await apiClient.get('/api/notifications/admin/promotional-stats');
    return response;
  },

  /**
   * Send promotional notification
   */
  async sendPromotionalNotification(request: PromotionalNotificationRequest): Promise<{ data: PromotionalNotificationResponse }> {
    const response = await apiClient.post('/api/notifications/admin/send-promotional', request);
    return response;
  },

  /**
   * Send test promotional notification
   */
  async testPromotionalNotification(request: TestPromotionalNotificationRequest): Promise<{ data: any }> {
    const response = await apiClient.post('/api/notifications/admin/test-promotional', request);
    return response;
  }
};