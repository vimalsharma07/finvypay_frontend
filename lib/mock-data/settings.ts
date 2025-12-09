// Mock settings data for static theme
export interface MockSettings {
  id: string;
  name: string;
  logo?: string | null;
  active: boolean;
  address?: string | null;
  websiteURL?: string | null;
  supportEmail?: string | null;
  supportPhone?: string | null;
  language: string;
  timezone: string;
  currency: string;
  currencyFormat: string;
  socialFacebook?: string | null;
  socialTwitter?: string | null;
  socialInstagram?: string | null;
  socialLinkedIn?: string | null;
  socialPinterest?: string | null;
  socialYoutube?: string | null;
  notifyStockEmail: boolean;
  notifyStockWeb: boolean;
  notifyStockThreshold: number;
  notifyStockRoleIds: string[];
  notifyNewOrderEmail: boolean;
  notifyNewOrderWeb: boolean;
  notifyNewOrderRoleIds: string[];
  notifyOrderStatusUpdateEmail: boolean;
  notifyOrderStatusUpdateWeb: boolean;
  notifyOrderStatusUpdateRoleIds: string[];
  notifyPaymentFailureEmail: boolean;
  notifyPaymentFailureWeb: boolean;
  notifyPaymentFailureRoleIds: string[];
  notifySystemErrorFailureEmail: boolean;
  notifySystemErrorWeb: boolean;
  notifySystemErrorRoleIds: string[];
}

export const mockSettings: MockSettings = {
  id: '1',
  name: 'My Company',
  logo: '/media/logos/logo.png',
  active: true,
  address: '123 Business Street, Suite 100, New York, NY 10001',
  websiteURL: 'https://example.com',
  supportEmail: 'support@example.com',
  supportPhone: '+1 (555) 123-4567',
  language: 'en',
  timezone: 'UTC',
  currency: 'USD',
  currencyFormat: '$ {value}',
  socialFacebook: 'https://facebook.com/example',
  socialTwitter: 'https://twitter.com/example',
  socialInstagram: 'https://instagram.com/example',
  socialLinkedIn: 'https://linkedin.com/company/example',
  socialPinterest: 'https://pinterest.com/example',
  socialYoutube: 'https://youtube.com/example',
  notifyStockEmail: true,
  notifyStockWeb: true,
  notifyStockThreshold: 10,
  notifyStockRoleIds: ['1', '2'],
  notifyNewOrderEmail: true,
  notifyNewOrderWeb: true,
  notifyNewOrderRoleIds: ['1', '2'],
  notifyOrderStatusUpdateEmail: true,
  notifyOrderStatusUpdateWeb: true,
  notifyOrderStatusUpdateRoleIds: ['1', '2'],
  notifyPaymentFailureEmail: true,
  notifyPaymentFailureWeb: true,
  notifyPaymentFailureRoleIds: ['1'],
  notifySystemErrorFailureEmail: true,
  notifySystemErrorWeb: true,
  notifySystemErrorRoleIds: ['1'],
};

