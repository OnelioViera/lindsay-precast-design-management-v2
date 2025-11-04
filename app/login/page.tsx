'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setRetryCount(0);

    try {
      console.log('Attempting login with:', { email });
      const result = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      console.log('SignIn result:', result);

      if (result?.error || !result?.ok) {
        console.log('Login failed:', result?.error);
        // Retry with longer delay to allow proper session cleanup
        if (retryCount < 1) {
          console.log('Retrying authentication after delay...');
          setRetryCount(prev => prev + 1);
          // Wait longer to ensure session is fully cleared
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const retryResult = await signIn('credentials', {
            email: email.trim().toLowerCase(),
            password,
            redirect: false,
          });

          console.log('Retry result:', retryResult);

          if (retryResult?.ok) {
            console.log('Login successful on retry');
            await new Promise(resolve => setTimeout(resolve, 500));
            window.location.href = '/dashboard';
            return;
          } else {
            console.log('Retry failed:', retryResult?.error);
            setError('Invalid email or password');
          }
        } else {
          setError('Invalid email or password');
        }
      } else if (result?.ok) {
        console.log('Login successful');
        // Wait for session to be established
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('Redirecting to dashboard');
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while session is being checked
  if (status === 'loading') {
    return (
      <div className="gradient-bg flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="gradient-bg flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-900">
            📋 Lindsay Precast
          </CardTitle>
          <CardDescription className="text-base text-gray-700">
            Design Management System
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={loading}
                autoComplete="current-password"
              />
            </div>
            {error && (
              <div className="bg-red-100 text-red-800 p-3 text-sm border border-red-400 rounded">
                <p className="font-semibold">{error}</p>
                <p className="text-xs mt-1">If this persists, try clearing your browser cache or using incognito mode.</p>
              </div>
            )}
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-gray-700">
            Don&apos;t have an account?{' '}
            <a href="/register" className="text-gray-900 hover:underline font-semibold border-b border-gray-900">
              Register here
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


