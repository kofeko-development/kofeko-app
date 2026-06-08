import { useCallback } from 'react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { ApiError } from '@/lib/api-client';
import { getErrorDisplay, type ErrorDisplay } from '@/lib/error-messages';
import { mapFieldErrors } from '@/lib/validation-errors';
import { ToastAction } from '@/components/ui/toast';

function validationToastDescription(fieldErrors: Record<string, string>): string | null {
  const messages = Object.values(fieldErrors).filter(Boolean);
  if (messages.length === 0) return null;
  if (messages.length === 1) return messages[0];
  return messages.join(' · ');
}

export type ApiErrorToastResult = {
  display: ErrorDisplay | null;
  fieldErrors: Record<string, string>;
};

function toastActionFor(display: ErrorDisplay) {
  if (!display.action || !display.actionHref) return undefined;

  if (display.actionHref.startsWith('mailto:') || display.actionHref.startsWith('http')) {
    return (
      <ToastAction altText={display.action} asChild>
        <a href={display.actionHref}>{display.action}</a>
      </ToastAction>
    );
  }

  return (
    <ToastAction altText={display.action} asChild>
      <Link href={display.actionHref}>{display.action}</Link>
    </ToastAction>
  );
}

export function useApiErrorToast() {
  const { toast } = useToast();

  const showError = useCallback((error: unknown): ApiErrorToastResult => {
    if (error instanceof ApiError) {
      const display = getErrorDisplay(error.errorCode, error.message);
      const fieldErrors = mapFieldErrors(error.details);
      const validationDescription = validationToastDescription(fieldErrors);
      const title =
        error.errorCode === 'VALIDATION_ERROR' && validationDescription
          ? 'Could not submit'
          : display.title;
      const description = validationDescription ?? display.description;
      toast({
        title,
        description,
        variant: 'destructive',
        action: toastActionFor(display),
      });
      return { display, fieldErrors };
    }

    toast({
      title: 'Error',
      description: error instanceof Error ? error.message : 'Something went wrong.',
      variant: 'destructive',
    });
    return { display: null, fieldErrors: {} };
  }, [toast]);

  return { showError };
}
