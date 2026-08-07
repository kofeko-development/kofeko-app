'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthButton } from '@/components/auth/AuthButton';
import { AuthPortalSwitcher } from '@/components/auth/AuthPortalSwitcher';
import { useAuth } from '@/lib/auth';
import { ApiError } from '@/lib/api-client';
import { useApiErrorToast } from '@/hooks/use-api-error-toast';

export default function CompanyLoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const { showError } = useApiErrorToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    if (password.length < 8) {
      setFieldErrors({ password: 'Password must be at least 8 characters.' });
      return;
    }

    setIsLoading(true);

    try {
      const user = await login({
        email,
        password,
      });
      if (user.status && user.status !== 'active') {
        showError(new Error('This account is currently pending or suspended. Please contact support.'));
        return;
      }

      if (user.role === 'operator') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.errorCode === 'APPROVAL_PENDING') {
          router.push('/signup-success?status=pending');
          return;
        }
        if (error.errorCode === 'APPROVAL_REJECTED') {
          router.push('/signup-success?status=rejected');
          return;
        }
      }

      const { fieldErrors: mapped } = showError(error);
      setFieldErrors(mapped);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col">
      <AuthPortalSwitcher active="company" />

      <div className="mb-10 text-center md:text-left">
        <h2 className="mb-2 text-3xl font-bold tracking-tight text-slate-900">Company Login</h2>
        <p className="text-sm text-slate-500">Enter your email and password to access your company account.</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        <AuthInput 
          id="email"
          label="Email Address" 
          type="email" 
          placeholder="admin@company.com" 
          required 
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (fieldErrors.email) {
              setFieldErrors((prev) => {
                const next = { ...prev };
                delete next.email;
                return next;
              });
            }
          }}
          disabled={isLoading}
          className={fieldErrors.email ? "border-destructive" : ""}
        />
        {fieldErrors.email ? (
          <p className="mt-1 text-sm text-destructive" role="alert">{fieldErrors.email}</p>
        ) : null}
        
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="ml-1 text-sm font-semibold text-slate-700">
              Password
            </label>
            <Link href="/forgot-password" className="text-xs font-semibold text-primary transition-colors hover:text-primary/80">
              Forgot password?
            </Link>
          </div>
          <AuthInput 
            id="password"
            type="password" 
            placeholder="••••••••" 
            required
            minLength={8}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password) {
                setFieldErrors((prev) => {
                  const next = { ...prev };
                  delete next.password;
                  return next;
                });
              }
            }}
            disabled={isLoading}
            className={fieldErrors.password ? "border-destructive" : ""}
          />
          {fieldErrors.password ? (
            <p className="mt-1 text-sm text-destructive" role="alert">{fieldErrors.password}</p>
          ) : null}
        </div>

        <div className="pt-4">
          <AuthButton type="submit" isLoading={isLoading}>
            Log In
          </AuthButton>
        </div>
      </form>

      <div className="mt-10 text-center text-sm text-slate-500">
        Don&apos;t have a company account?{' '}
        <Link href="/company-signup" className="font-semibold text-primary transition-colors hover:text-primary/80">
          Register Company
        </Link>
      </div>
    </div>
  );
}
