# Project Migration Status - Auxlo

## Goal
Restore the project to a buildable state for deployment to Vercel by removing dependencies on the missing `(main)` folder and `unified-data` infrastructure.

## Changes Made

### 1. Route & Component Cleanup
- **Deleted `app/components/slug`**: This directory contained a `page.tsx` that referenced `@/app/(main)/data/blog`. Since the blog is not part of the current Auxlo setup, this was removed.
- **Updated `app/components/Navbar.tsx`**: Removed the mobile navigation link to `/blog`.
- **Updated `app/components/OurWorkSection.tsx`**: 
    - Removed `import { findByService } from "../(main)/data/blog";`
    - Modified `getSnippetForService` to return static descriptions instead of attempting to fetch from the missing blog file.

### 2. Authentication Refactoring
- **Refactored `lib/auth-config.ts`**:
    - Removed dependency on `@/lib/unified-data`.
    - **Credentials Provider**: Now queries `prisma.userProfile` directly to verify users.
    - **Google Provider**: Now uses `prisma.userProfile.upsert` to sync user profiles on login.
    - **Session/JWT Callbacks**: Already used Prisma, but verified paths.

## Current Status
- All identified broken imports (`@/app/(main)` and `@/lib/unified-data`) have been removed or replaced with Prisma logic.
- The project is ready for a build test.

## Next Steps for Vercel Deployment
1. **Local Build Test**: Run `npm run build` locally to ensure no other `Module not found` errors occur.
2. **Vercel Setup**: 
    - Connect the repository to Vercel.
    - Set the **Root Directory** if necessary (though it seems to be the current directory).
    - Add the following **Environment Variables**:
        - `DATABASE_URL`
        - `NEXTAUTH_SECRET`
        - `NEXTAUTH_URL`
        - `GOOGLE_CLIENT_ID`
        - `GOOGLE_CLIENT_SECRET`
3. **Prisma**: Ensure `npx prisma generate` runs during the build (usually automatic if `prisma` is a dependency, or add to `install` command).

## Missing Files Note
The `(main)` folder and `lib/unified-data.ts` were recovered from a previous build's source tarball during analysis but were intentionally excluded from the final code to keep the Auxlo setup lean and functional as requested.
