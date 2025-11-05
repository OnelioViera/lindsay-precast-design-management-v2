import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectDB } from './db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

// Determine the base URL based on environment
const getBaseUrl = () => {
  // Explicit NEXTAUTH_URL takes priority
  if (process.env.NEXTAUTH_URL) {
    console.log('Using NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
    return process.env.NEXTAUTH_URL;
  }
  // Vercel auto-provides VERCEL_URL
  if (process.env.VERCEL_URL) {
    const url = `https://${process.env.VERCEL_URL}`;
    console.log('Using VERCEL_URL:', url);
    return url;
  }
  // Fallback to localhost
  console.log('Using localhost fallback: http://localhost:3000');
  return 'http://localhost:3000';
};

const baseUrl = getBaseUrl();

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials');
          return null;
        }

        try {
          const email = (credentials.email as string).toLowerCase();
          console.log('🔐 Auth attempt for:', email);

          // Check for environment variable admin account first (takes priority)
          const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
          const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

          console.log('🔐 Checking env vars - ADMIN_EMAIL:', adminEmail, 'Has ADMIN_PASSWORD_HASH:', !!adminPasswordHash);

          if (adminEmail && adminPasswordHash && email === adminEmail) {
            console.log('🔐 Admin login attempt - checking env vars');
            console.log('   Attempting bcrypt.compare with provided password');
            const isPasswordValid = await bcrypt.compare(
              credentials.password as string,
              adminPasswordHash
            );

            if (isPasswordValid) {
              console.log('✅ Admin password valid (from env var)');
              return {
                id: 'admin-env',
                email: adminEmail,
                name: 'Administrator',
                role: 'admin',
              };
            } else {
              console.log('❌ Admin password invalid (from env var)');
              console.log('   Password provided does not match ADMIN_PASSWORD_HASH');
              // Don't return null yet - fall through to database check
              // This allows database admins to login even if env var password is wrong
            }
          } else if (adminEmail && !adminPasswordHash) {
            console.log('⚠️  ADMIN_EMAIL set but ADMIN_PASSWORD_HASH is missing');
          }

          // Fall back to database lookup for regular users and database admins
          await connectDB();
          const user = await User.findOne({ email });

          if (!user) {
            console.log('❌ User not found:', email);
            console.log('   Database connected, but user does not exist');
            return null;
          }

          console.log('✅ User found:', email, 'Role:', user.role);

          // Verify password exists
          if (!user.password) {
            console.log('❌ User password not set:', email);
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password as string
          );

          if (!isPasswordValid) {
            console.log('❌ Password mismatch for:', email);
            console.log('   Provided password does not match stored hash');
            return null;
          }

          console.log('✅ Password valid for:', email);

          // Update last login
          user.lastLogin = new Date();
          await user.save();

          console.log('✅ Login successful for:', email);
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error('❌ Auth error:', error);
          // Log detailed error for debugging
          if (error instanceof Error) {
            console.error('   Error message:', error.message);
            console.error('   Error type:', error.name);
            if (error.message.includes('getaddrinfo')) {
              console.error('   → Database connection failed');
            }
          }
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      // During login, user object is present
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.role = (user as any).role;
      } else if (token.id && token.id !== 'admin-env') {
        // On subsequent calls (session refresh), fetch fresh data from database
        // BUT: Skip database lookup for admin-env token (env var based admin)
        try {
          await connectDB();
          const dbUser = await User.findById(token.id);
          if (dbUser) {
            token.name = dbUser.name;
            token.role = dbUser.role;
          }
        } catch (error) {
          console.error('Error fetching user in JWT callback:', error);
        }
      }
      // For admin-env, keep the existing token data (don't modify it)
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        (session.user as any).id = token.id;
        session.user.name = token.name;
        (session.user as any).role = token.role;
        console.log('📋 Session created for user:', session.user.email, 'Role:', (session.user as any).role);
      }
      return session;
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // Ensures we always redirect to the correct domain
      // For signOut, url will be the callbackUrl from signOut()
      console.log('🔄 Redirect callback - url:', url, 'baseUrl:', baseUrl);
      
      // If url starts with /, it's a relative URL - make it absolute with baseUrl
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      
      // If url starts with our baseUrl, it's already correct
      if (url.startsWith(baseUrl)) {
        return url;
      }
      
      // Default to baseUrl for security
      return baseUrl;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
    signOut: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  } as const,
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  baseUrl: baseUrl,
  events: {
    async signOut() {
      // Session is being cleared by NextAuth
      // Client will handle redirect to login page
    },
  },
};

// Create auth instance for NextAuth v5
export const { auth, handlers } = NextAuth(authOptions);

