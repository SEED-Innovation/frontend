// ================================
// 🎯 ENUMS (Match your backend)
// ================================
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  GUEST = 'GUEST'
}

export enum SubscriptionPlan {
  FREE = 'FREE',
  PREMIUM = 'PREMIUM',
  VIP = 'VIP'
}

export enum SkillLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  PROFESSIONAL = 'PROFESSIONAL'
}

export enum AccountPrivacy {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  FRIENDS_ONLY = 'FRIENDS_ONLY'
}

// ================================
// 🎯 RESPONSE TYPES (Match your backend)
// ================================

export interface BadgeResponse {
  id: number;
  name: string;
  description: string;
  iconUrl?: string;
  earnedAt: string;
}

export interface UserResponse {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  profilePictureUrl?: string;
  points: number;
  allTimeRank: number;
  monthlyRank: number;
  badges: BadgeResponse[];
  skillLevel: SkillLevel;
  profileVisibility: AccountPrivacy;
  birthday: string;
  height?: number;
  weight?: number;
  role: UserRole;
  plan: SubscriptionPlan;
  enabled: boolean;
  guest: boolean;
}

// Short version for booking responses
export interface UserShortResponse {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  profilePictureUrl?: string;
}

// ================================
// 🎯 REQUEST TYPES (Match your backend)
// ================================

export interface CreateUserRequest {
  fullName: string;
  email: string;
  phone: string;
  username: string;
  password: string;
  birthday: string;
  skillLevel: SkillLevel;
  profileVisibility: AccountPrivacy;
  profilePictureUrl?: string;
  height?: number;
  weight?: number;
  role: UserRole;
  plan: SubscriptionPlan;
}

export interface UpdateUserRequest {
  // Identifier fields (one of these is required)
  id?: number;
  email?: string;
  username?: string;
  
  // Update fields (optional)
  fullName?: string;
  phone?: string;
  birthday?: string;
  skillLevel?: SkillLevel;
  profileVisibility?: AccountPrivacy;
  profilePictureUrl?: string;
  height?: number;
  weight?: number;
  role?: UserRole;
  plan?: SubscriptionPlan;
  enabled?: boolean;
}

export interface GetUserByIdentifierRequest {
  id?: number;
  email?: string;
  username?: string;
}

export interface DeleteUserRequest {
  id?: number;
  email?: string;
  username?: string;
}

// ================================
// 🎯 SEARCH & FILTER TYPES
// ================================

export interface UserSearchParams {
  query: string;
  limit?: number;
  skillLevel?: SkillLevel;
  role?: UserRole;
  plan?: SubscriptionPlan;
  enabled?: boolean;
}

export interface UserFilterRequest {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
  role?: UserRole;
  plan?: SubscriptionPlan;
  skillLevel?: SkillLevel;
  enabled?: boolean;
  searchQuery?: string;
}

export interface PaginatedUserResponse {
  content: UserResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// ================================
// 🎯 STATISTICS & ANALYTICS
// ================================

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  usersByRole: Record<UserRole, number>;
  usersByPlan: Record<SubscriptionPlan, number>;
  usersBySkillLevel: Record<SkillLevel, number>;
  topPlayersByPoints: UserResponse[];
}

// ================================
// 🎯 UTILITY TYPES
// ================================

export interface UserProfileUpdate {
  fullName?: string;
  phone?: string;
  birthday?: string;
  height?: number;
  weight?: number;
  skillLevel?: SkillLevel;
  profileVisibility?: AccountPrivacy;
  profilePictureUrl?: string;
}

export interface UserPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  language: 'ar' | 'en';
  timezone: string;
  currency: 'SAR' | 'USD';
}

// ================================
// 🎯 FORM TYPES (For UI Components)
// ================================

export interface CreateUserFormData {
  fullName: string;
  email: string;
  phone: string;
  username: string;
  password: string;
  confirmPassword: string;
  birthday: string;
  skillLevel: SkillLevel;
  profileVisibility: AccountPrivacy;
  height?: string; // String for form inputs
  weight?: string; // String for form inputs
  role: UserRole;
  plan: SubscriptionPlan;
}

export interface UpdateUserFormData {
  identifier: string;
  identifierType: 'id' | 'email' | 'username';
  fullName?: string;
  phone?: string;
  birthday?: string;
  skillLevel?: SkillLevel;
  profileVisibility?: AccountPrivacy;
  height?: string;
  weight?: string;
  role?: UserRole;
  plan?: SubscriptionPlan;
  enabled?: boolean;
}

// ================================
// 🎯 VALIDATION TYPES
// ================================

export interface UserValidationRules {
  fullName: {
    required: boolean;
    minLength: number;
    maxLength: number;
  };
  email: {
    required: boolean;
    pattern: RegExp;
  };
  phone: {
    required: boolean;
    pattern: RegExp; // Saudi phone number pattern
  };
  password: {
    required: boolean;
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  };
}

// ================================
// 🎯 CONSTANTS FOR SAUDI CULTURE
// ================================

export const SAUDI_CONSTANTS = {
  PHONE_PREFIX: '+966',
  TIMEZONE: 'Asia/Riyadh',
  CURRENCY: 'SAR',
  WEEKEND_DAYS: [5, 6], // Friday and Saturday
  LOCALE: 'ar-SA',
  DATE_FORMAT: 'dd/MM/yyyy',
  TIME_FORMAT: 'HH:mm'
} as const;

// ================================
// 🎯 ERROR TYPES
// ================================

export interface UserListItem {
  id: number;
  username: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  profilePictureUrl?: string | null; // optional profile picture URL
  plan: string | null;           // "Premium" | "Basic" | "Free" | etc.
  status: string;                // "Active" | "Disabled" (treat "Disabled" as "Suspended" badge)
  joinDate: string | null;       // "yyyy-MM-dd"
  totalSessions: number | null;
  rank: number | null;
  lastLogin: string | null;      // ISO string or null
  profilePictureUrl?: string | null;
}

export interface AdminUserPageResponse {
  users: UserListItem[];
  totalElements: number;
  totalPages: number;
  currentPage: number;  // 0-based
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// ================================
// 🎯 ERROR TYPES
// ================================

export interface UserError {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, any>;
}

export interface UserApiError {
  status: number;
  message: string;
  errors?: UserError[];
  timestamp: string;
}