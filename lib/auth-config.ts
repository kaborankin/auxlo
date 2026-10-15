import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getUserMemberships, isDevUser } from '@/lib/authorize';
import prisma from '@/lib/db';
import { getAdminEmails } from '@/lib/utils/env';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    // Auxlo Google OAuth
    GoogleProvider({
      clientId: (process.env.GOOGLE_CLIENT_ID || '').trim(),
      clientSecret: (process.env.GOOGLE_CLIENT_SECRET || '').trim(),
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Use Prisma directly
          const user = await prisma.userProfile.findUnique({
            where: { email: credentials.email }
          });
          
          if (!user || !user.hashedPassword) return null;

          const valid = await bcrypt.compare(credentials.password, user.hashedPassword);
          if (!valid) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/auth/signin', // Default signin page
    error: '/auth/error', // Custom error page that redirects based on provider
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('[SignIn Callback] Provider:', account?.provider, 'User:', user.email);
      
      // For Auxlo Google OAuth, allow all signups (access controlled via UserMembership)
      if (account?.provider === 'google') {
        const email = user.email || '';

        try {
          // Create or update user profile for all Google signups
          const userProfile = await prisma.userProfile.upsert({
            where: { email },
            update: {
              name: user.name || profile?.name || email.split('@')[0],
              authProvider: 'google',
              authId: account?.providerAccountId,
              lastActiveAt: new Date(),
            },
            create: {
              id: crypto.randomUUID(),
              email,
              name: user.name || profile?.name || email.split('@')[0],
              authProvider: 'google',
              authId: account?.providerAccountId,
              source: 'google_oauth_login',
              lastActiveAt: new Date(),
              status: 'new', // Explicitly set new for onboarding trigger
            }
          });

          // Allow sign in to complete, but we'll handle redirect via middleware or client-side
          // (Redirecting here can sometimes interfere with session cookie establishment)
          return true;
        } catch (error) {
          console.error('Failed to upsert Google user profile:', error);
          return false; // Prevent login if profile creation fails
        }
      }
      
      // For credentials provider, check if user has membership
      if (account?.provider === 'credentials') {
        const email = user.email || '';

        try {
          // Bump lastActiveAt and fetch the profile (with memberships) in one round trip.
          const userProfile = await prisma.userProfile.update({
            where: { email },
            data: { lastActiveAt: new Date() },
            include: { memberships: true },
          });

          if (!userProfile) {
            console.log(`User ${email} has no profile - denying credentials login`);
            return false;
          }

          // Brand-new signups (status === 'new') haven't been through onboarding
          // yet, so having zero memberships at this point is expected — they
          // must be allowed to sign in so middleware can route them to
          // /auth/onboard, which is what creates their first membership.
          // Established users (status !== 'new') still require at least one
          // membership — this preserves the original access-control intent.
          if (userProfile.status !== 'new' && userProfile.memberships.length === 0) {
            console.log(`User ${email} has no memberships and is not new - denying credentials login`);
            return false; // Credentials auth requires existing membership for established accounts
          }

          return true;
        } catch (error) {
          console.error('Failed credentials authentication:', error);
          return false;
        }
      }

      // For other providers (if any), defer to default behaviour
      return true;
    },
    async redirect({ url, baseUrl }) {
      console.log('[NextAuth Redirect] url:', url, 'baseUrl:', baseUrl);
      
      // If the URL is a fully qualified URL from our app, allow it
      if (url.startsWith(baseUrl)) {
        console.log('[NextAuth Redirect] Allowing same-origin URL:', url);
        return url;
      }
      
      // If it's a relative path (starts with /), prepend baseUrl
      if (url.startsWith('/')) {
        const fullUrl = `${baseUrl}${url}`;
        console.log('[NextAuth Redirect] Converting relative path to full URL:', fullUrl);
        return fullUrl;
      }
      
      // Default to baseUrl if nothing else matches
      console.log('[NextAuth Redirect] Using baseUrl fallback:', baseUrl);
      return baseUrl;
    },
    async session({ session, token }) {
      if (session.user) {
        const userId = token.sub as string;
        (session.user as any).id = userId;
        (session.user as any).status = token.status;
        
        // Store the provider info in session for routing logic
        (session.user as any).provider = token.provider;
        
        // Add role and isAdmin to session from token
        (session.user as any).role = token.role || 'user';
        (session.user as any).isAdmin = token.isAdmin || token.role === 'admin';
        
        console.log(`[Session Callback] Auxlo user ${session.user.email} - role: ${(session.user as any).role}, isAdmin: ${(session.user as any).isAdmin}`);
        
        // Use memberships from token if available (set during sign-in or update)
        // Otherwise fetch from database
        if (token.memberships && Array.isArray(token.memberships) && token.memberships.length > 0) {
          (session.user as any).memberships = token.memberships;
          (session.user as any).currentOrgId = (token.memberships as any[])[0]?.organizationId;
        } else {
          // Fallback: fetch memberships from the Auxlo database
          try {
            // Use the email to lookup since sub might be an OAuth ID rather than database ID
            const userProfile = await prisma.userProfile.findUnique({
              where: { email: session.user.email || '' },
            });
            
            if (userProfile) {
              (session.user as any).status = userProfile.status;
              const memberships = await getUserMemberships(userProfile.id);
              (session.user as any).memberships = memberships;
              (session.user as any).currentOrgId = memberships[0]?.organizationId;
              console.log(`[Session Callback] Loaded ${memberships.length} memberships from DB for ${session.user.email}`);
            } else {
              (session.user as any).memberships = [];
            }
          } catch (error) {
            console.error('[Session Callback] Failed to load user memberships from Auxlo DB:', error);
            (session.user as any).memberships = [];
          }
        }
        
        // Check if dev user
        try {
          const isDev = await isDevUser(session.user.email || '');
          (session.user as any).isDev = isDev;
        } catch (error) {
          console.error('[Session Callback] Failed to check dev user status:', error);
          (session.user as any).isDev = false;
        }
      }
      return session;
    },
    async jwt({ token, user, account, trigger }) {
      if (user) {
        token.id = user.id;
        
        // Store provider info in token
        if (account?.provider) {
          token.provider = account.provider;
        }
        
        // Check if user is admin (required for all admin access)
        const adminEmails = getAdminEmails({ lowercase: true });
        const normalizedEmail = (user.email || '').toLowerCase();
        const isAdmin = adminEmails.includes(normalizedEmail);
        
        token.role = isAdmin ? 'admin' : 'user';
        token.isAdmin = isAdmin;
        
        // Load memberships on initial sign-in
        // Need to get the UserProfile ID from email first
        try {
          console.log('JWT callback - user.id:', user.id, 'user.email:', user.email);
          
          // Look up the user profile by email to get the database ID
          const userProfile = await prisma.userProfile.findUnique({
            where: { email: user.email || '' },
          });
          
          console.log('JWT callback - found userProfile:', userProfile?.id);
          
          if (userProfile) {
            token.userId = userProfile.id; // Store user ID in token
            token.status = userProfile.status; // Store user status in token
            const memberships = await getUserMemberships(userProfile.id);
            console.log('JWT callback - loaded memberships:', memberships.length);
            token.memberships = memberships;
          } else {
            console.log('JWT callback - no userProfile found for', user.email);
            token.userId = null;
            token.memberships = [];
          }
        } catch (error) {
          console.error('Failed to load memberships on sign-in:', error);
          token.memberships = [];
        }
      }
      
      // On update trigger (manual session refresh), reload memberships
      if (trigger === 'update' && token.sub) {
        try {
          console.log('JWT callback - update trigger for token.sub:', token.sub);
          
          // Look up user profile by email to get database ID
          const userProfile = await prisma.userProfile.findUnique({
            where: { email: token.email as string },
          });
          
          if (userProfile) {
            token.userId = userProfile.id; // Update user ID in token
            token.status = userProfile.status; // Update status in token
            const memberships = await getUserMemberships(userProfile.id);
            console.log('JWT callback - refreshed memberships:', memberships.length);
            token.memberships = memberships;
          }
        } catch (error) {
          console.error('Failed to refresh memberships in JWT:', error);
        }
      }
      
      return token;
    },
    // session callback is defined above with richer behaviour (kept there)
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development', // Enable debug logs in development
};