# Employee Wellness App

A modern, full-stack wellness and health tracking platform for employees built with Next.js, Firebase, and Tailwind CSS.

## 🎯 Features

### Employee Portal
- **Dashboard**: Break launcher, progress ring (streak tracking), daily schedule, and wellness tips
- **Activities**: Browse and filter wellness activities (Stretching, Walking, Aerobic, Strengthening, Desk Exercises)
- **Break Flow**: Guided 30-minute wellness breaks (5m warm-up → 15m video → 5m cool-down → 5m message)
- **Progress Tracking**: Monitor personal wellness streaks and completion history
- **Health Education**: Access wellness tips and educational resources
- **Challenges**: Participate in company-wide wellness challenges
- **Feedback**: Submit wellness feedback and suggestions

### Admin Portal
- **Dashboard**: High-level metrics and participation analytics
- **Participation Logs**: Track employee wellness activity
- **Activity Management**: CRUD operations for wellness content
- **Education Management**: Manage health education resources
- **Analytics**: Detailed participation reports and trends
- **Feedback Review**: View and respond to employee feedback

## 🏗️ Project Structure

```
daily-wellness/
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Root layout
│   │   ├── not-found.tsx                 # 404 page
│   │   ├── (auth)/                       # Auth route group
│   │   │   ├── layout.tsx
│   │   │   └── login/page.tsx
│   │   ├── (employee)/                   # Employee route group
│   │   │   ├── layout.tsx                # Navigation layout
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── activities/page.tsx
│   │   │   ├── break/page.tsx
│   │   │   ├── check-in/page.tsx
│   │   │   ├── progress/page.tsx
│   │   │   ├── education/page.tsx
│   │   │   ├── challenges/page.tsx
│   │   │   └── feedback/page.tsx
│   │   └── (admin)/                      # Admin route group
│   │       ├── layout.tsx
│   │       └── admin/
│   │           ├── dashboard/page.tsx
│   │           ├── participation/page.tsx
│   │           ├── activities/page.tsx
│   │           ├── education/page.tsx
│   │           ├── stats/page.tsx
│   │           └── feedback/page.tsx
│   ├── lib/
│   │   ├── firebase.ts                   # Firebase configuration
│   │   ├── types.ts                      # TypeScript types
│   │   └── mockData.ts                   # Development mock data
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   └── ProgressRing.tsx
│   │   ├── employee/
│   │   │   ├── BreakLauncher.tsx
│   │   │   ├── StreakCard.tsx
│   │   │   ├── DailySchedule.tsx
│   │   │   ├── WellnessTip.tsx
│   │   │   └── EmployeeNav.tsx
│   │   ├── admin/
│   │   │   └── AdminNav.tsx
│   │   └── auth/
│   ├── hooks/
│   ├── styles/
│   │   └── globals.css
│   └── public/
├── middleware.ts                         # Role-based access control
├── next.config.ts                        # Next.js configuration
├── tailwind.config.ts                    # Tailwind CSS configuration
├── tsconfig.json                         # TypeScript configuration
├── postcss.config.js                     # PostCSS configuration
├── package.json
├── .env.local.example                    # Environment template
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Firebase account and project

### Installation

1. **Clone or navigate to the project**:
   ```bash
   cd "c:\Users\Housekeeping\Desktop\daily wellnes"
   ```

2. **Install dependencies** (already done):
   ```bash
   npm install
   ```

3. **Configure Firebase**:
   - Copy `.env.local.example` to `.env.local`
   - Go to [Firebase Console](https://firebase.google.com)
   - Create a new project or select existing one
   - Create a Web App and copy the config values
   - Update `.env.local` with your Firebase credentials:
     ```env
     NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
     NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
     ```

4. **Create Firestore Collections**:
   - In Firebase Console → Firestore Database
   - Create these collections:
     - `users` - Employee and admin profiles
     - `activity_logs` - Wellness activity completion logs
     - `activities` - Wellness content library
     - `feedback` - Employee feedback submissions
     - `check_ins` - Post-break wellness check-ins
     - `challenges` - Company wellness challenges

5. **Run development server**:
   ```bash
   npm run dev
   ```
   - Open [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## 🎨 Design System

### Color Palette
- **Primary**: Teal (`#0d9488`)
- **Accent**: Emerald (`#10b981`)
- **Neutral**: Slate shades
- **Activity Categories**:
  - Stretching: Purple
  - Walking: Blue
  - Aerobic: Red
  - Strengthening: Green
  - Desk Exercises: Orange

### Typography
- Font Stack: System fonts (Segoe UI, Roboto, etc.)
- Sizes: 8-step scale with responsive breakpoints

### Components
- **Card**: Rounded corners (`rounded-xl`), subtle shadow, border
- **Button**: Variants (primary, secondary, danger, ghost), multiple sizes
- **Progress Ring**: Circular progress visualization for streak tracking

## 🔐 Security & Role-Based Access Control

The middleware (`middleware.ts`) implements:
- JWT token validation
- Role-based route protection
- Auto-redirect based on user role
- Token expiration handling

### Protected Routes
- `/admin/*` - Admin-only routes
- `/dashboard/*` - Employee routes (authenticated users)
- `/login` - Public authentication route

## 📦 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **react-youtube** - YouTube video embeds
- **recharts** - Data visualization

### Backend & Services
- **Firebase Authentication** - User authentication
- **Firestore** - Real-time NoSQL database
- **Next.js API Routes** - Serverless functions

### Development
- **ESLint** - Code quality
- **PostCSS** - CSS processing
- **Autoprefixer** - Browser compatibility

## 📋 API & Firestore Schema

### Collections

#### `users`
```javascript
{
  uid: string,
  email: string,
  role: 'employee' | 'admin',
  streak: number,
  totalBreaksCompleted: number,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### `activities`
```javascript
{
  activityId: string,
  title: string,
  category: 'Stretching' | 'Walking' | 'Aerobic' | 'Strengthening' | 'Desk exercises',
  videoUrl: string,
  durationMinutes: number,
  description: string,
  createdAt: timestamp
}
```

#### `activity_logs`
```javascript
{
  logId: string,
  userId: string,
  timestamp: timestamp,
  durationMinutes: number,
  type: string,
  completed: boolean,
  activityId: string,
  notes: string
}
```

#### `feedback`
```javascript
{
  feedbackId: string,
  userId: string,
  message: string,
  date: timestamp,
  rating: number (1-10),
  category: string
}
```

## 🧪 Testing with Mock Data

The app comes with comprehensive mock data for development and testing:
- 5 sample wellness activities
- Daily wellness tips database
- Mock user progress and streaks
- Sample daily schedule
- Admin analytics data

All mock data is in `src/lib/mockData.ts` and can be replaced with real Firestore data.

## 🔄 Next Steps & Future Enhancements

1. **Firestore Integration**
   - Replace mock data with real Firestore queries
   - Implement real-time listeners for activity feeds
   - Add user progress tracking

2. **Authentication**
   - Implement Firebase Auth sign-up flow
   - Email verification
   - Password reset functionality
   - OAuth integrations (Google, Microsoft)

3. **Video Integration**
   - Implement react-youtube for video playback
   - Track video completion for break flow validation
   - Add custom video progress

4. **Analytics & Charts**
   - Replace chart placeholders with Recharts visualizations
   - Real-time participation metrics
   - Export reports functionality

5. **Push Notifications**
  - Create a Web Push certificate in Firebase Console > Project Settings > Cloud Messaging.
  - Add its public key as `NEXT_PUBLIC_FIREBASE_VAPID_KEY` and set a long `CRON_SECRET` in the deployment environment.
  - Configure a trusted scheduler to POST to `/api/notifications/send` at the desired times with the `x-cron-secret` header. The request body may be `{ "title": "Wellness activity time", "body": "Time for your activity", "url": "/dashboard" }`.
  - After an employee enables alarms, their browser token is stored and can receive notifications with the tab or browser closed. Tokens are removed during logout.

6. **Mobile App**
   - React Native adaptation
   - Offline support
   - Native push notifications

## 📝 Development Guidelines

### Coding Standards
- Use TypeScript for type safety
- Follow React best practices (hooks, server components where appropriate)
- Use Tailwind CSS classes (no custom CSS files)
- Add JSDoc comments for complex functions
- Maintain consistent file naming (camelCase for components)

### Component Structure
```typescript
// 'use client' for interactive components
'use client';

import type { ComponentProps } from 'react';

interface Props extends ComponentProps<'div'> {
  // Component-specific props
}

export default function ComponentName({ ...props }: Props) {
  // Implementation
}
```

### Adding New Features
1. Create types in `src/lib/types.ts`
2. Add mock data to `src/lib/mockData.ts` for testing
3. Create components in appropriate folder
4. Create pages using the layout structure
5. Update navigation as needed
6. Test with mock data before Firestore integration

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change port when running dev server
npm run dev -- -p 3001
```

### Firebase Configuration Issues
- Verify `.env.local` has all required variables
- Check Firebase project settings
- Ensure Firestore is initialized in Firebase Console
- Verify CORS settings if using remote Firebase

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

## 📞 Support & Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Documentation](https://react.dev)

## 📄 License

Private project - All rights reserved.

---

**Last Updated**: 2026-08-23  
**Status**: Phase 1 Complete - Ready for Firestore Integration


## Project Structure

```
daily-wellness/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Authentication routes
│   │   │   ├── login/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (employee)/               # Employee routes
│   │   │   ├── dashboard/
│   │   │   ├── activities/
│   │   │   ├── break/
│   │   │   ├── check-in/
│   │   │   ├── progress/
│   │   │   ├── education/
│   │   │   ├── challenges/
│   │   │   ├── feedback/
│   │   │   └── layout.tsx
│   │   ├── (admin)/                  # Admin routes
│   │   │   ├── admin/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── participation/
│   │   │   │   ├── activities/
│   │   │   │   ├── education/
│   │   │   │   ├── stats/
│   │   │   │   └── feedback/
│   │   │   └── layout.tsx
│   │   ├── layout.tsx                # Root layout
│   │   └── not-found.tsx
│   ├── lib/
│   │   ├── firebase.ts               # Firebase initialization
│   │   └── types.ts                  # TypeScript types
│   ├── components/
│   │   ├── common/                   # Shared components
│   │   └── auth/                     # Auth components
│   ├── hooks/                        # Custom React hooks
│   └── styles/
│       └── globals.css               # Global Tailwind styles
├── public/                           # Static assets
├── middleware.ts                     # Route protection & RBAC
├── .env.local                        # Environment variables
├── .env.local.example                # Environment template
├── next.config.ts                    # Next.js configuration
├── tailwind.config.ts                # Tailwind CSS configuration
├── tsconfig.json                     # TypeScript configuration
└── package.json                      # Dependencies
```

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm/yarn
- Firebase project created at [firebase.google.com](https://firebase.google.com)

### 1. Install Dependencies

```bash
npm install
# or
yarn install
```

### 2. Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Get your Firebase credentials:
   - Go to Firebase Console → Project Settings
   - Copy your Web App Configuration
   - Add to `.env.local`:
     ```
     NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_id
     NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
     ```

### 3. Setup Firestore Database

1. In Firebase Console → Firestore Database → Create Database
2. Start in test mode for development
3. Create the following collections:
   - `users`
   - `activity_logs`
   - `activities`
   - `feedback`

### 4. Run Development Server

```bash
npm run dev
# or
yarn dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Firestore Schema

### Users Collection
```typescript
{
  uid: string;
  email: string;
  role: 'employee' | 'admin';
  streak: number;
  totalBreaksCompleted: number;
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

### Activity Logs Collection
```typescript
{
  logId: string;
  userId: string;
  timestamp: timestamp;
  durationMinutes: number;
  type: string;
  completed: boolean;
  activityId?: string;
  notes?: string;
}
```

### Activities Collection
```typescript
{
  activityId: string;
  title: string;
  category: 'wellness' | 'education' | 'challenge' | 'break';
  videoUrl?: string;
  durationMinutes: number;
  description?: string;
  createdAt: timestamp;
}
```

### Feedback Collection
```typescript
{
  feedbackId: string;
  userId: string;
  message: string;
  date: timestamp;
  rating?: number;
  category?: string;
}
```

## Architecture Decisions

### Route Groups
- `(auth)` - Public authentication routes
- `(employee)` - Employee-only protected routes
- `(admin)` - Admin-only protected routes

### Middleware (RBAC)
- Validates JWT tokens from Firebase
- Protects routes based on user role
- Redirects unauthorized users to login

### Component Organization
- **common/** - Reusable components (Navbar, Sidebar, LoadingSpinner)
- **auth/** - Authentication-related components

### Styling
- Tailwind CSS with custom theme configuration
- Wellness-focused color palette (teal, emerald, slate)
- Mobile-first responsive design

## Development Tips

- Use `@/` path alias for cleaner imports: `import { User } from '@/lib/types'`
- Add custom hooks in `src/hooks/` for reusable logic
- Create reusable components in `src/components/`
- Firestore types are pre-defined in `lib/types.ts`

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect repository to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy with one click

```bash
npm run build
# or
yarn build
```

## Next Phase Features

- User authentication UI (email/password)
- Activity logging forms
- Progress visualization with progress rings
- Embedded YouTube player for wellness videos
- Real-time Firestore data binding
- Admin dashboard with analytics
- Push notifications

## Support

For questions or issues, please refer to the Next.js and Firebase documentation.
