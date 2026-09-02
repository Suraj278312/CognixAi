'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth, getFriendlyAuthErrorMessage } from '@/hooks/useAuth';

export function ForgotPasswordForm() {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordReset(email);
      setSuccess(true);
    } catch (err: unknown) {
      setError(getFriendlyAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 rounded-2xl bg-surface-1 border border-border-strong shadow-floating space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground font-sans">
          Reset your password
        </h1>
        <p className="text-xs text-foreground-muted">
          Enter your email address and we will send you a password reset link.
        </p>
      </div>

      {success ? (
        <div className="p-4 rounded-xl bg-status-success/10 border border-status-success/20 space-y-3 text-center">
          <CheckCircle2 className="w-8 h-8 text-status-success mx-auto" />
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-foreground">Reset Link Sent</h4>
            <p className="text-[11px] text-foreground-muted">
              Check your inbox at <span className="font-mono text-foreground">{email}</span> for instructions to reset your password.
            </p>
          </div>
          <Link href="/login" className="block pt-2">
            <Button variant="outline" size="sm" className="w-full justify-center">
              Return to Sign In
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-status-error/10 border border-status-error/20 text-xs text-status-error">
              {error}
            </div>
          )}

          <Input
            label="Email Address"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full justify-center"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Send Reset Link
          </Button>

          <div className="text-center pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-1 text-xs text-foreground-muted hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
