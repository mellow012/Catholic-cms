// types/index.ts - Core TypeScript interfaces and types

import { Timestamp } from '@firebase/firestore';

// ============================================================================
// AUTH & ROLES
// ============================================================================

export type UserRole =
  | 'PARISH_PRIEST'
  | 'PARISH_SECRETARY'
  | 'DEANERY_ADMIN'
  | 'DIOCESAN_CHANCELLOR'
  | 'DIOCESAN_ARCHIVE_ADMIN'
  | 'BISHOP'
  | 'DIOCESAN_SUPER_ADMIN'
  | 'ECM_SUPER_ADMIN'
  | 'READ_ONLY_VIEWER';

export type ClearanceLevel = 'parish' | 'deanery' | 'diocese' | 'ecm';

export interface CustomClaims {
  role: UserRole;
  clearanceLevel: ClearanceLevel;
  dioceseId?: string; // e.g., 'mangochi'
  parishId?: string; // e.g., 'st-augustine-cathedral'
  deaneryId?: string; // e.g., 'mangochi-central'
}

export interface AppUser {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: UserRole;
  clearanceLevel: ClearanceLevel;
  dioceseId?: string;
  parishId?: string;
  deaneryId?: string;
  createdAt: Date;
  lastLogin?: Date;
}

// ============================================================================
// DIOCESE, DEANERY, PARISH
// ============================================================================

export interface Diocese {
  id: string; // 'mangochi', 'lilongwe', etc.
  name: string; // 'Diocese of Mangochi'
  type: 'archdiocese' | 'diocese';
  bishop: string;
  cathedral: string;
  sealUrl?: string; // Firebase Storage URL for official seal
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Deanery {
  id: string;
  dioceseId: string;
  name: string; // 'Mangochi Central Deanery'
  dean?: string; // Parish Priest name
  parishes: string[]; // Array of parish IDs
  createdAt: Date;
  updatedAt: Date;
}

export interface Parish {
  id: string;
  dioceseId: string;
  deaneryId: string;
  name: string; // 'St. Augustine Cathedral'
  priest?: string;
  secretary?: string;
  address?: string;
  contactPhone?: string;
  massSchedule?: MassSchedule[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MassSchedule {
  dayOfWeek: string; // 'Sunday', 'Monday', etc.
  time: string; // '07:00', '18:00'
  language?: string; // 'English', 'Chichewa'
}

// ============================================================================
// MEMBERS & FAMILIES
// ============================================================================

export interface Member {
  id: string;
  dioceseId: string;
  parishId: string;
  // Personal Info
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth?: Date;
  placeOfBirth?: string;
  gender?: 'male' | 'female';
  // Contact
  phone?: string;
  email?: string;
  address?: string;
  // Church Status
  baptized: boolean;
  confirmed: boolean;
  married: boolean;
  // Family Links (IDs)
  fatherId?: string;
  motherId?: string;
  spouseId?: string;
  childrenIds?: string[];
  // Linked Sacraments (for quick access)
  baptismId?: string;
  confirmationId?: string;
  marriageId?: string;
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // User UID
}

// ============================================================================
// SACRAMENTS
// ============================================================================

export type SacramentType =
  | 'baptism'
  | 'confirmation'
  | 'eucharist'
  | 'marriage'
  | 'holy_orders'
  | 'anointing'
  | 'reconciliation'
  | 'funeral';

export interface BaseSacrament {
  id: string;
  type: SacramentType;
  dioceseId: string;
  parishId: string;
  date: Date;
  location: string; // Church name
  officiantName: string; // Priest/Bishop
  registryNumber?: string; // Book/page reference
  certificateUrl?: string; // Generated PDF URL
  certificateHash?: string; // Blockchain hash (premium)
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  approvedBy?: string;
  approved: boolean;
}

export interface Baptism extends BaseSacrament {
  type: 'baptism';
  // Subject
  memberId: string;
  baptismType: 'infant' | 'adult';
  // Parents
  fatherId?: string;
  fatherName?: string;
  motherId?: string;
  motherName?: string;
  // Godparents
  godfather?: string;
  godfatherParish?: string;
  godmother?: string;
  godmotherParish?: string;
  // Witnesses
  witnesses?: string[];
}

export interface Confirmation extends BaseSacrament {
  type: 'confirmation';
  memberId: string;
  confirmationName?: string; // Saint name chosen
  sponsorName?: string;
  sponsorParish?: string;
  bishop: string; // Usually bishop confirms
}

export interface Marriage extends BaseSacrament {
  type: 'marriage';
  // Couple
  groomId: string;
  groomName: string;
  brideId: string;
  brideName: string;
  // Witnesses
  witness1Name: string;
  witness2Name: string;
  // Pre-marriage
  bannsPublished: boolean;
  bannsDate1?: Date;
  bannsDate2?: Date;
  bannsDate3?: Date;
  premarriageCourseCompleted: boolean;
  // Legal
  civilMarriageDate?: Date;
  civilRegistryNumber?: string;
}

export interface HolyOrders extends BaseSacrament {
  type: 'holy_orders';
  memberId: string;
  orderType: 'deacon' | 'priest' | 'bishop';
  bishop: string; // Ordaining bishop
  incardination?: string; // Diocese of incardination
}

export interface Anointing extends BaseSacrament {
  type: 'anointing';
  memberId: string;
  reason?: string;
}

export interface Funeral extends BaseSacrament {
  type: 'funeral';
  memberId: string;
  dateOfDeath: Date;
  placeOfDeath?: string;
  burialLocation?: string;
}

export type Sacrament = Baptism | Confirmation | Marriage | HolyOrders | Anointing | Funeral;

// ============================================================================
// EVENTS
// ============================================================================

export type EventType =
  | 'mass'
  | 'retreat'
  | 'feast'
  | 'meeting'
  | 'sacrament'
  | 'fundraiser'
  | 'other';

export interface Event {
  id: string;
  dioceseId: string;
  parishId?: string; // Null for diocese-wide events
  title: string;
  description?: string;
  type: EventType;
  // Date/Time
  startDate: Date;
  endDate?: Date;
  allDay: boolean;
  // Location
  location: string;
  // RSVP
  requiresRSVP: boolean;
  maxAttendees?: number;
  attendees?: string[]; // Member IDs
  // Resources
  resources?: string[]; // e.g., ['main-hall', 'projector']
  // Reminders
  reminderSent: boolean;
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface RSVP {
  id: string;
  eventId: string;
  memberId?: string;
  name: string;
  email?: string;
  phone?: string;
  numberOfGuests: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  createdAt: Date;
}

// ============================================================================
// AUDIT & LOGS
// ============================================================================

export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string; // 'create', 'update', 'delete', 'approve'
  resource: string; // 'baptism', 'member', 'event'
  resourceId: string;
  changes?: Record<string, any>; // Old vs new values
  timestamp: Date;
  ipAddress?: string;
}

// ============================================================================
// REPORTS
// ============================================================================

export interface SacramentReport {
  dioceseId: string;
  parishId?: string;
  year: number;
  baptisms: number;
  confirmations: number;
  marriages: number;
  holyOrders: number;
  anointings: number;
  funerals: number;
  total: number;
}

// ============================================================================
// API RESPONSES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================================================
// FORM DATA (for frontend forms)
// ============================================================================

export interface BaptismFormData {
  // Subject
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  placeOfBirth?: string;
  gender: 'male' | 'female';
  baptismType: 'infant' | 'adult';
  // Sacrament Details
  baptismDate: string;
  location: string;
  officiantName: string;
  registryNumber?: string;
  // Parents
  fatherName?: string;
  motherName?: string;
  // Godparents
  godfather?: string;
  godfatherParish?: string;
  godmother?: string;
  godmotherParish?: string;
  // Witnesses
  witnesses?: string[];
  notes?: string;
}

export interface MarriageFormData {
  // Couple
  groomFirstName: string;
  groomLastName: string;
  groomDateOfBirth: string;
  brideFirstName: string;
  brideLastName: string;
  brideDateOfBirth: string;
  // Sacrament Details
  marriageDate: string;
  location: string;
  officiantName: string;
  registryNumber?: string;
  // Witnesses
  witness1Name: string;
  witness2Name: string;
  // Pre-marriage
  bannsPublished: boolean;
  bannsDate1?: string;
  bannsDate2?: string;
  bannsDate3?: string;
  premarriageCourseCompleted: boolean;
  civilMarriageDate?: string;
  civilRegistryNumber?: string;
  notes?: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type FirestoreTimestamp = Timestamp;

// Helper to convert Firestore Timestamp to Date
export function timestampToDate(timestamp: FirestoreTimestamp | Date | undefined): Date | undefined {
  if (!timestamp) return undefined;
  if (timestamp instanceof Date) return timestamp;
  return timestamp.toDate();
}