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
          await connectDB();
          const email = (credentials.email as string).toLowerCase();
          console.log('🔐 Auth attempt for:', email);
          
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
      } else if (token.id) {
        // On subsequent calls (session refresh), fetch fresh data from database
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
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        (session.user as any).id = token.id;
        session.user.name = token.name;
        (session.user as any).role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
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

