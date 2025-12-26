// lib/constants.ts - Application constants

import { UserRole, ClearanceLevel, SacramentType, EventType } from '@/types';

// ============================================================================
// ROLES & PERMISSIONS
// ============================================================================

export const ROLES: Record<string, { label: string; clearance: ClearanceLevel }> = {
  PARISH_PRIEST: { label: 'Parish Priest', clearance: 'parish' },
  PARISH_SECRETARY: { label: 'Parish Secretary', clearance: 'parish' },
  DEANERY_ADMIN: { label: 'Deanery Administrator', clearance: 'deanery' },
  DIOCESAN_CHANCELLOR: { label: 'Diocesan Chancellor', clearance: 'diocese' },
  DIOCESAN_ARCHIVE_ADMIN: { label: 'Diocesan Archive Admin', clearance: 'diocese' },
  BISHOP: { label: 'Bishop', clearance: 'diocese' },
  DIOCESAN_SUPER_ADMIN: { label: 'Diocesan Super Admin', clearance: 'diocese' },
  ECM_SUPER_ADMIN: { label: 'ECM Super Admin', clearance: 'ecm' },
  READ_ONLY_VIEWER: { label: 'Read-Only Viewer', clearance: 'parish' },
};

// Permissions map: what each role can do
export const PERMISSIONS = {
  // Sacrament permissions
  CREATE_SACRAMENT: ['PARISH_PRIEST', 'PARISH_SECRETARY', 'DIOCESAN_SUPER_ADMIN', 'ECM_SUPER_ADMIN'],
  EDIT_SACRAMENT: ['PARISH_PRIEST', 'PARISH_SECRETARY', 'DIOCESAN_CHANCELLOR', 'DIOCESAN_SUPER_ADMIN', 'ECM_SUPER_ADMIN'],
  DELETE_SACRAMENT: ['BISHOP', 'DIOCESAN_SUPER_ADMIN', 'ECM_SUPER_ADMIN'],
  APPROVE_SACRAMENT: ['DIOCESAN_CHANCELLOR', 'BISHOP', 'DIOCESAN_SUPER_ADMIN'],
  VIEW_SACRAMENT: ['PARISH_PRIEST', 'PARISH_SECRETARY', 'DEANERY_ADMIN', 'DIOCESAN_CHANCELLOR', 'DIOCESAN_ARCHIVE_ADMIN', 'BISHOP', 'DIOCESAN_SUPER_ADMIN', 'ECM_SUPER_ADMIN', 'READ_ONLY_VIEWER'],
  GENERATE_CERTIFICATE: ['PARISH_PRIEST', 'PARISH_SECRETARY', 'DIOCESAN_CHANCELLOR', 'DIOCESAN_SUPER_ADMIN', 'ECM_SUPER_ADMIN'],
  
  // Member permissions
  CREATE_MEMBER: ['PARISH_PRIEST', 'PARISH_SECRETARY', 'DIOCESAN_SUPER_ADMIN', 'ECM_SUPER_ADMIN'],
  EDIT_MEMBER: ['PARISH_PRIEST', 'PARISH_SECRETARY', 'DIOCESAN_SUPER_ADMIN', 'ECM_SUPER_ADMIN'],
  DELETE_MEMBER: ['BISHOP', 'DIOCESAN_SUPER_ADMIN', 'ECM_SUPER_ADMIN'],
  VIEW_MEMBER: ['PARISH_PRIEST', 'PARISH_SECRETARY', 'DEANERY_ADMIN', 'DIOCESAN_CHANCELLOR', 'DIOCESAN_ARCHIVE_ADMIN', 'BISHOP', 'DIOCESAN_SUPER_ADMIN', 'ECM_SUPER_ADMIN', 'READ_ONLY_VIEWER'],
  
  // Event permissions
  CREATE_EVENT: ['PARISH_PRIEST', 'PARISH_SECRETARY', 'DEANERY_ADMIN', 'DIOCESAN_SUPER_ADMIN', 'ECM_SUPER_ADMIN'],
  EDIT_EVENT: ['PARISH_PRIEST', 'PARISH_SECRETARY', 'DEANERY_ADMIN', 'DIOCESAN_SUPER_ADMIN', 'ECM_SUPER_ADMIN'],
  DELETE_EVENT: ['PARISH_PRIEST', 'DEANERY_ADMIN', 'DIOCESAN_SUPER_ADMIN', 'ECM_SUPER_ADMIN'],
  VIEW_EVENT: ['PARISH_PRIEST', 'PARISH_SECRETARY', 'DEANERY_ADMIN', 'DIOCESAN_CHANCELLOR', 'DIOCESAN_ARCHIVE_ADMIN', 'BISHOP', 'DIOCESAN_SUPER_ADMIN', 'ECM_SUPER_ADMIN', 'READ_ONLY_VIEWER'],
  
  // Admin permissions
  MANAGE_USERS: ['BISHOP', 'DIOCESAN_SUPER_ADMIN', 'ECM_SUPER_ADMIN'],
  MANAGE_DIOCESE: ['BISHOP', 'DIOCESAN_SUPER_ADMIN', 'ECM_SUPER_ADMIN'],
  VIEW_AUDIT_LOGS: ['DIOCESAN_CHANCELLOR', 'BISHOP', 'DIOCESAN_SUPER_ADMIN', 'ECM_SUPER_ADMIN'],
  VIEW_REPORTS: ['DEANERY_ADMIN', 'DIOCESAN_CHANCELLOR', 'BISHOP', 'DIOCESAN_SUPER_ADMIN', 'ECM_SUPER_ADMIN'],
};

// Helper function to check permission
export function hasPermission(userRole: UserRole, permission: keyof typeof PERMISSIONS): boolean {
  return PERMISSIONS[permission]?.includes(userRole) || false;
}

// ============================================================================
// DIOCESES IN MALAWI
// ============================================================================

export const DIOCESES = {
  mangochi: { name: 'Diocese of Mangochi', type: 'diocese', bishop: 'Rt. Rev. Montfort Stima' },
  lilongwe: { name: 'Archdiocese of Lilongwe', type: 'archdiocese', bishop: 'Most Rev. George Tambala' },
  blantyre: { name: 'Archdiocese of Blantyre', type: 'archdiocese', bishop: 'Most Rev. Thomas Luke Msusa' },
  chikwawa: { name: 'Diocese of Chikwawa', type: 'diocese', bishop: 'Rt. Rev. Peter Musikuwa' },
  dedza: { name: 'Diocese of Dedza', type: 'diocese', bishop: 'Rt. Rev. Emmanuel Kanyama' },
  karonga: { name: 'Diocese of Karonga', type: 'diocese', bishop: 'Rt. Rev. Martin Anwel Mtumbuka' },
  mzuzu: { name: 'Diocese of Mzuzu', type: 'diocese', bishop: 'Rt. Rev. John Ryan' },
  zomba: { name: 'Diocese of Zomba', type: 'diocese', bishop: 'Rt. Rev. George Desmond Tambala' },
};

// ============================================================================
// SACRAMENTS
// ============================================================================

export const SACRAMENT_TYPES: { value: SacramentType; label: string; icon: string }[] = [
  { value: 'baptism', label: 'Baptism', icon: '💧' },
  { value: 'confirmation', label: 'Confirmation', icon: '🕊️' },
  { value: 'eucharist', label: 'First Holy Communion', icon: '🍞' },
  { value: 'marriage', label: 'Marriage', icon: '💍' },
  { value: 'holy_orders', label: 'Holy Orders', icon: '✝️' },
  { value: 'anointing', label: 'Anointing of the Sick', icon: '🙏' },
  { value: 'reconciliation', label: 'Reconciliation', icon: '🕯️' },
  { value: 'funeral', label: 'Funeral Rites', icon: '🌹' },
];

// ============================================================================
// EVENTS
// ============================================================================

export const EVENT_TYPES: { value: EventType; label: string; color: string }[] = [
  { value: 'mass', label: 'Mass', color: '#22c55e' }, // green
  { value: 'retreat', label: 'Retreat', color: '#3b82f6' }, // blue
  { value: 'feast', label: 'Feast Day', color: '#f59e0b' }, // gold
  { value: 'meeting', label: 'Meeting', color: '#8b5cf6' }, // purple
  { value: 'sacrament', label: 'Sacrament Celebration', color: '#ec4899' }, // pink
  { value: 'fundraiser', label: 'Fundraiser', color: '#10b981' }, // emerald
  { value: 'other', label: 'Other', color: '#6b7280' }, // gray
];

// ============================================================================
// DAYS OF WEEK
// ============================================================================

export const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

// ============================================================================
// MALAWI CATHOLIC CONTEXT
// ============================================================================

export const PATRON_SAINTS = [
  'St. Augustine',
  'St. Francis of Assisi',
  'St. Patrick',
  'St. Joseph',
  'St. Mary',
  'St. Peter',
  'St. Paul',
  'St. Michael',
  'St. Theresa',
  'St. Anthony',
];

export const COMMON_CHICHEWA_NAMES = {
  male: ['Mphatso', 'Chimwemwe', 'Chifundo', 'Limbani', 'Kondwani'],
  female: ['Tamanda', 'Chikondi', 'Chisomo', 'Thandiwe', 'Pemphero'],
};

// ============================================================================
// VALIDATION RULES
// ============================================================================

export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_NAME_LENGTH: 100,
  MAX_NOTES_LENGTH: 1000,
  PHONE_REGEX: /^(\+265|0)?[1-9]\d{8}$/, // Malawi phone format
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

// ============================================================================
// FIRESTORE COLLECTIONS
// ============================================================================

export const COLLECTIONS = {
  DIOCESES: 'dioceses',
  DEANERIES: 'deaneries',
  PARISHES: 'parishes',
  MEMBERS: 'members',
  SACRAMENTS: 'sacraments',
  EVENTS: 'events',
  RSVPS: 'rsvps',
  AUDIT_LOGS: 'auditLogs',
  USERS: 'users',
};

// ============================================================================
// PAGINATION
// ============================================================================

export const DEFAULT_PAGE_SIZE = 25;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// ============================================================================
// DATE FORMATS
// ============================================================================

export const DATE_FORMAT = 'dd/MM/yyyy';
export const DATETIME_FORMAT = 'dd/MM/yyyy HH:mm';
export const TIME_FORMAT = 'HH:mm';