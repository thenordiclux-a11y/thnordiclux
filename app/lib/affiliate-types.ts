export interface AffiliateSocialHandles {
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  youtube?: string;
  pinterest?: string;
}

export interface AffiliateMember {
  id: string;
  name: string;
  email: string;
  password: string;
  affiliateCode: string;
  commissionRate: number;
  status: 'active' | 'pending' | 'suspended';
  phone?: string;
  bio?: string;
  socialHandles?: AffiliateSocialHandles;
  totalClicks: number;
  totalConversions: number;
  totalEarnings: number;
  pendingEarnings: number;
  createdAt: string;
  updatedAt: string;
}

export interface AffiliateClick {
  id: string;
  affiliateId: string;
  affiliateCode: string;
  productId?: string;
  productName?: string;
  source: 'link' | 'facebook' | 'twitter' | 'instagram' | 'whatsapp' | 'pinterest' | 'email' | 'copy' | 'native';
  createdAt: string;
}

export interface AffiliateReferral {
  id: string;
  affiliateId: string;
  affiliateCode: string;
  orderId: string;
  orderNumber: string;
  orderTotal: number;
  commission: number;
  status: 'pending' | 'approved' | 'paid';
  createdAt: string;
}

export interface AffiliateSettings {
  defaultCommissionRate: number;
  cookieDays: number;
  programName: string;
  programDescription: string;
}

export const DEFAULT_AFFILIATE_SETTINGS: AffiliateSettings = {
  defaultCommissionRate: 10,
  cookieDays: 30,
  programName: 'Nordic Lux Affiliate Program',
  programDescription:
    'Earn commission by sharing Nordic Lux products with your audience. Get your unique links and promote on social media.',
};
