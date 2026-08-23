# 🚀 Quick Reference Guide

## Project Quick Start

### 1. Start Development
```bash
cd "c:\Users\Housekeeping\Desktop\daily wellnes"
npm run dev
# Visit http://localhost:3000
```

### 2. Test the App
- **Employee Portal**: Click dashboard links (uses mock data)
- **Admin Portal**: Navigate to `/admin/dashboard` (uses mock data)
- **Login Page**: Visit `/login` (placeholder)

### 3. Verify Setup
```bash
npm run type-check    # Check TypeScript types
npm run build        # Build for production
npm run lint         # Check code quality
```

## Environment Setup

### Firebase Configuration
1. Create `.env.local` file (copy from `.env.local.example`)
2. Add your Firebase Web App credentials:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=xxxxx
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxxxx.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxxxx
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxxxx.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxxxx
   NEXT_PUBLIC_FIREBASE_APP_ID=xxxxx
   ```

## File Navigation

### Pages to Explore
- **Employee Dashboard**: `src/app/(employee)/dashboard/page.tsx`
- **Activities**: `src/app/(employee)/activities/page.tsx`
- **Break Flow**: `src/app/(employee)/break/page.tsx`
- **Admin Dashboard**: `src/app/(admin)/admin/dashboard/page.tsx`
- **Login**: `src/app/(auth)/login/page.tsx`

### Components to Study
- **ProgressRing**: `src/components/common/ProgressRing.tsx`
- **EmployeeNav**: `src/components/employee/EmployeeNav.tsx`
- **BreakLauncher**: `src/components/employee/BreakLauncher.tsx`

### Configuration Files
- `src/lib/firebase.ts` - Firebase setup
- `src/lib/types.ts` - All TypeScript types
- `src/lib/mockData.ts` - Development data
- `middleware.ts` - Route protection
- `tailwind.config.ts` - Theme colors

## Color Reference

```typescript
// Primary Colors
bg-teal-600    // Primary button/brand
text-teal-600  // Primary text

// Accent Colors
bg-emerald-500    // Success/accent
text-emerald-500  // Accent text

// Neutral
bg-slate-50      // Page background
bg-white         // Card background
text-slate-900   // Heading text
text-slate-600   // Body text

// Activity Categories
bg-purple-50   // Stretching
bg-blue-50     // Walking
bg-red-50      // Aerobic
bg-green-50    // Strengthening
bg-orange-50   // Desk Exercises
```

## Component Usage Examples

### Button
```tsx
<Button variant="primary" size="md" onClick={() => {}}>
  Click Me
</Button>
```

### Card
```tsx
<Card title="My Card" className="p-6">
  Card content here
</Card>
```

### ProgressRing
```tsx
<ProgressRing 
  percentage={75}
  label="Participation"
  size="md"
  color="emerald"
/>
```

## Common Tasks

### Add a New Page
1. Create file: `src/app/(group)/feature/page.tsx`
2. Add "use client" directive if interactive
3. Import components and data
4. Export default component

### Add a New Component
1. Create file: `src/components/category/ComponentName.tsx`
2. Add interface for props with TypeScript
3. Use "use client" if interactive
4. Export default function

### Add Mock Data
1. Open `src/lib/mockData.ts`
2. Add your data array/object
3. Export it
4. Import in your page/component

### Update Types
1. Open `src/lib/types.ts`
2. Add/modify interface
3. Export it
4. Use in components

## Navigation Structure

### Employee Routes
```
/ → Redirects based on role
/login → Public login page
/dashboard → Employee dashboard
/activities → Browse activities
/break → Guided break flow
/check-in → Post-break check-in
/progress → Streak tracking
/education → Wellness education
/challenges → Company challenges
/feedback → Submit feedback
```

### Admin Routes
```
/admin/dashboard → Analytics overview
/admin/participation → Employee logs
/admin/activities → Manage activities
/admin/education → Manage education
/admin/stats → Detailed analytics
/admin/feedback → Review feedback
```

## Debugging Tips

### Check TypeScript Errors
```bash
npm run type-check
```

### View Network Requests
1. Open DevTools (F12)
2. Go to Network tab
3. Check requests to Firebase

### Test Mock Data
1. Mock data loads automatically (no Firebase needed)
2. Check browser console for errors
3. Inspect component state in React DevTools

### Common Issues

**Port Already in Use**
```bash
npm run dev -- -p 3001
```

**Module Not Found**
- Check import paths use `@/` alias
- Verify file exists in correct folder

**TypeScript Errors**
- Run `npm run type-check`
- Check types in `src/lib/types.ts`

## Useful VS Code Extensions

- ESLint
- Tailwind CSS IntelliSense
- Thunder Client (for API testing)
- Firebase Explorer (for Firestore)

## Git Workflow

```bash
# Check status
git status

# Stage changes
git add .

# Commit
git commit -m "Feature: Add XYZ"

# Push
git push origin main
```

## Performance Tips

- Use Next.js Image component for images
- Implement lazy loading for lists
- Use React.memo for expensive components
- Monitor bundle size with `npm run build`

## Deployment

### Vercel (Recommended for Next.js)
1. Connect GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Other Platforms
- Firebase Hosting
- Netlify
- AWS Amplify

## Resources

- [Project README](./README.md) - Full documentation
- [Setup Complete](./SETUP_COMPLETE.md) - Setup details
- [Next.js Docs](https://nextjs.org/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [Tailwind Docs](https://tailwindcss.com/docs)

## Terminal Commands Cheatsheet

```bash
npm install              # Install dependencies
npm run dev             # Start dev server
npm run build           # Build for production
npm start               # Start production server
npm run type-check      # Check TypeScript
npm run lint            # Run ESLint
npm run lint --fix      # Auto-fix lint issues
```

## Keyboard Shortcuts

**Development**
- `Ctrl+C` - Stop dev server
- `F12` - Open DevTools
- `Ctrl+Shift+R` - Hard refresh

**VS Code**
- `Ctrl+P` - Quick file open
- `Ctrl+F` - Find
- `Ctrl+H` - Find and replace
- `Ctrl+/` - Toggle comment

---

**Last Updated**: 2026-08-23
**Status**: Ready for Development
