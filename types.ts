export enum UserRole {
  GUEST = 'GUEST',
  ADMIN = 'ADMIN', // You
  FIELD_OWNER = 'FIELD_OWNER',
  TEAM_CAPTAIN = 'TEAM_CAPTAIN'
}

export enum SubscriptionPlan {
  NONE = 'NONE',
  WEEKLY = 'WEEKLY', // Avulso
  MONTHLY = 'MONTHLY',
  ANNUAL = 'ANNUAL'
}

export interface SubTeam {
  id: string;
  name: string;
  category: string; // e.g., "Sub-20", "Principal"
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Stored for "fake" auth simulation
  phoneNumber: string;
  role: UserRole;
  subscription: SubscriptionPlan;
  subscriptionExpiry: string | null;
  // New fields
  subTeams: SubTeam[]; 
  latitude?: number;
  longitude?: number;
}

export interface PixConfig {
  key: string;
  name: string;
}

export interface Field {
  id: string;
  ownerId: string;
  name: string;
  location: string;
  hourlyRate: number;
  cancellationFeePercent: number;
  pixConfig: PixConfig;
  imageUrl: string;
  contactPhone: string;
  latitude: number;
  longitude: number;
}

export interface MatchSlot {
  id: string;
  fieldId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  isBooked: boolean;
  
  // Host Team Info
  hasLocalTeam: boolean;
  localTeamName?: string; 
  allowedCategories: string[]; // e.g., ["Sub-20", "Adulto"]
  
  // Visitor/Booker Info
  bookedByTeamName?: string; // The specific sub-team name
  bookedByUserId?: string;
  bookedByPhone?: string;
  bookedByCategory?: string; // Which category filled the slot
  
  status: 'available' | 'pending_verification' | 'confirmed';
  price: number;
}

export interface VerificationResult {
  isValid: boolean;
  amountFound: number | null;
  dateFound: string | null;
  reason: string;
}

export const COMMON_CATEGORIES = ["Sub-09", "Sub-11", "Sub-13", "Sub-15", "Sub-17", "Sub-20", "Principal", "Veteranos", "Feminino"];
