# Malawi Catholic Church Management System (MCCMS)

A comprehensive, secure, and scalable platform for managing Catholic Church operations across Malawi's 8 dioceses under the Episcopal Conference of Malawi (ECM).

## 🌍 Overview

The MCCMS digitizes church operations with emphasis on:
- **Tamper-proof sacrament records** (baptisms, confirmations, marriages, etc.)
- **Event and calendar management** for Masses, retreats, and feasts
- **Member and family profiles** with genealogical connections
- **Role-based access control** from parish to national ECM level

### Dioceses Covered
- **Archdioceses**: Lilongwe, Blantyre
- **Dioceses**: Chikwawa, Dedza, Karonga, Mangochi, Mzuzu, Zomba

## 🏗️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **UI/UX**: Tailwind CSS 4, Shadcn/UI, Lucide Icons
- **Backend/Database**: Firebase (Firestore, Auth, Storage, Functions)
- **Forms**: React Hook Form + Zod validation
- **PDF Generation**: @react-pdf/renderer, pdf-lib
- **Calendar**: FullCalendar
- **Deployment**: Vercel

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ and npm/yarn
- Firebase project (create at [console.firebase.google.com](https://console.firebase.google.com))
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/malawi-catholic-cms.git
   cd malawi-catholic-cms
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   
   a. Create a Firebase project in [Firebase Console](https://console.firebase.google.com)
   
   b. Enable Authentication (Email/Password)
   
   c. Create Firestore Database (start in production mode, we'll add rules)
   
   d. Enable Storage
   
   e. Get your Firebase config:
      - Go to Project Settings > General
      - Scroll to "Your apps" and click the web icon (</>) to create a web app
      - Copy the config object
   
   f. Generate service account key:
      - Go to Project Settings > Service Accounts
      - Click "Generate new private key"
      - Download the JSON file

4. **Configure environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` and fill in:
   - Firebase client config (NEXT_PUBLIC_* variables)
   - Firebase service account JSON (FIREBASE_SERVICE_ACCOUNT_KEY)

5. **Run development server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000)

## 👥 User Roles & Permissions

### Role Hierarchy

| Role | Clearance Level | Permissions |
|------|----------------|-------------|
| **Parish Priest/Secretary** | Parish | Create/edit sacraments & members in their parish, generate certificates |
| **Deanery Admin** | Deanery | View/search across parishes in their deanery |
| **Diocesan Chancellor** | Diocese | Full diocese view/export, approve records |
| **Bishop/Diocesan Super Admin** | Diocese | All diocese operations + analytics + user management |
| **ECM Super Admin** | National (ECM) | Nationwide access, cross-diocese reports, top-level config |
| **Read-Only Viewer** | Parish | Approved genealogical queries only |

### Setting User Roles

Roles are managed via Firebase Custom Claims. After a user signs up:

1. Super Admin assigns role via Settings > User Management
2. System calls `/api/auth/set-claims` with Admin SDK
3. User's next login will have updated permissions

## 📁 Project Structure

```
malawi-catholic-cms/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (server-side)
│   │   ├── auth/          # Authentication endpoints
│   │   ├── sacraments/    # Sacrament CRUD + PDF generation
│   │   ├── members/       # Member management
│   │   └── events/        # Event/calendar operations
│   ├── dashboard/         # Main admin dashboard
│   ├── sacraments/        # Sacrament records module
│   ├── events/            # Event/calendar module
│   ├── members/           # Member profiles module
│   ├── settings/          # Admin settings
│   ├── auth/              # Sign-in/sign-up pages
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # Reusable UI components
│   ├── ui/               # Shadcn/UI components
│   ├── SacramentForm.tsx
│   ├── CertificatePDF.tsx
│   ├── FamilyTree.tsx
│   ├── CalendarView.tsx
│   ├── RoleGuard.tsx
│   └── NavSidebar.tsx
├── lib/                   # Core utilities
│   ├── firebase.ts       # Client Firebase SDK
│   ├── firebaseAdmin.ts  # Server Admin SDK
│   ├── authHelper.ts     # Auth utilities
│   ├── utils.ts          # General helpers
│   ├── constants.ts      # App constants
│   └── hooks/
│       └── useRBAC.ts    # Role-based access hook
├── types/                 # TypeScript definitions
│   └── index.ts
├── public/                # Static assets
│   ├── icons/
│   ├── seals/            # Diocese seals for certificates
│   └── manifest.json
└── .env.local            # Environment variables (not in git)
```

## 🔐 Security Features

### Role-Based Access Control (RBAC)
- Firebase Custom Claims for server-side verification
- Client-side hooks (`useRBAC`) for UI protection
- Firestore Security Rules for data-level protection

### Audit Logging
All sensitive operations (create/edit/delete sacraments) are logged:
- User ID, email, timestamp
- Action type, resource, changes
- IP address (when available)

### Tamper-Proof Records
- Immutable sacrament IDs
- Approval workflow for edits
- Optional blockchain hashing (premium feature)

### Offline Support
- Firestore offline persistence enabled
- Critical for rural parishes with poor connectivity

## 🗄️ Database Schema

### Firestore Structure

```
ecm/ (top-level document)
dioceses/
  {dioceseId}/
    - metadata (name, bishop, seal URL, etc.)
    deaneries/
      {deaneryId}/
        - metadata
    parishes/
      {parishId}/
        - metadata (priest, contact, mass schedule)
    members/
      {memberId}/
        - personal info, family links, sacrament refs
    sacraments/
      {sacramentId}/
        - type, date, location, officiant, linked members
    events/
      {eventId}/
        - title, type, date, RSVP info
    auditLogs/
      {logId}/
        - userId, action, resource, timestamp
```

### Firestore Security Rules (Basic)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper: Get user's role from custom claims
    function getUserRole() {
      return request.auth.token.role;
    }
    
    // Diocese data
    match /dioceses/{dioceseId} {
      allow read: if request.auth != null;
      allow write: if getUserRole() in ['BISHOP', 'DIOCESAN_SUPER_ADMIN', 'ECM_SUPER_ADMIN'];
      
      // Sacraments
      match /sacraments/{sacramentId} {
        allow read: if request.auth != null;
        allow create: if getUserRole() in ['PARISH_PRIEST', 'PARISH_SECRETARY', 'DIOCESAN_SUPER_ADMIN', 'ECM_SUPER_ADMIN'];
        allow update: if getUserRole() in ['PARISH_PRIEST', 'PARISH_SECRETARY', 'DIOCESAN_CHANCELLOR', 'DIOCESAN_SUPER_ADMIN', 'ECM_SUPER_ADMIN'];
        allow delete: if getUserRole() in ['BISHOP', 'DIOCESAN_SUPER_ADMIN', 'ECM_SUPER_ADMIN'];
      }
      
      // Members
      match /members/{memberId} {
        allow read: if request.auth != null;
        allow write: if getUserRole() in ['PARISH_PRIEST', 'PARISH_SECRETARY', 'DIOCESAN_SUPER_ADMIN', 'ECM_SUPER_ADMIN'];
      }
      
      // Events
      match /events/{eventId} {
        allow read: if request.auth != null;
        allow write: if getUserRole() in ['PARISH_PRIEST', 'PARISH_SECRETARY', 'DEANERY_ADMIN', 'DIOCESAN_SUPER_ADMIN', 'ECM_SUPER_ADMIN'];
      }
    }
  }
}
```

## 📊 Key Features by Module

### 1. Sacrament Records
- ✅ Entry forms for all 7 sacraments + funerals
- ✅ Auto-generate unique IDs
- ✅ Link to member profiles
- ✅ Digital certificate generation (PDF with seal + QR code)
- ✅ Advanced search (name, date, parish, type)
- ✅ Export to CSV/PDF
- 🔄 Premium: Blockchain hashing, genealogy tools, OCR bulk import

### 2. Event & Calendar
- ✅ Shared calendar (month/week/day views)
- ✅ Color-coded event types (Masses, retreats, feasts)
- ✅ RSVP/registration with capacity limits
- ✅ Resource booking (halls, equipment)
- 🔄 Reminders (push notifications, email/SMS)

### 3. Member & Family Profiles
- ✅ Central member database
- ✅ Link sacraments automatically
- ✅ Simple family relationships (parents/children/spouse)
- 🔄 Genealogy graph visualization

### 4. Admin & Settings
- ✅ User/role management
- ✅ Diocese/parish/deanery configuration
- ✅ Upload seals and logos
- 🔄 Reports & analytics (sacrament stats, attendance)
- ✅ Audit log viewer

## 🌐 Malawi Catholic Church Context

### Episcopal Conference of Malawi (ECM)
The ECM coordinates all Catholic dioceses in Malawi. This system enables:
- Centralized record-keeping while respecting diocesan autonomy
- Cross-diocese searches (e.g., verifying sacraments for transfers)
- National statistics and reports

### Diocese of Mangochi (Initial Focus)
- **Bishop**: Rt. Rev. Montfort Stima
- **Cathedral**: St. Augustine Cathedral
- **Structure**: ~25 parishes across 5 deaneries
- **Challenges**: Rural parishes with limited internet, legacy paper records

### Language Support
- **Primary**: English (official church language)
- 🔄 **Future**: Chichewa (national language) via i18n

## 🚢 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables from `.env.local`
   - Deploy

3. **Configure Firebase**
   - Add your Vercel domain to Firebase authorized domains
   - Update `NEXT_PUBLIC_APP_URL` in environment variables

### Firebase Hosting (Alternative)

```bash
npm run build
firebase deploy
```

## 🧪 Testing

```bash
# Run tests (to be implemented)
npm test

# Lint
npm run lint
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Episcopal Conference of Malawi (ECM)
- Diocese of Mangochi
- Inspired by Parishinfo and INSYS platforms
- Catholic Church in Malawi

## 📧 Support

For support, email: support@malawiccms.org (to be set up)

---

Built with ❤️ for the Catholic Church in Malawi
