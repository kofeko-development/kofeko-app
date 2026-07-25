import { useCallback } from 'react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { ApiError } from '@/lib/api-client';
import {
  ERROR_CATEGORIES,
  ERROR_CODES,
  toastVariantForCategory,
} from '@/lib/error-categories';
import { resolveApiErrorDisplay, type ErrorDisplay } from '@/lib/error-messages';
import { hasFieldErrors, mapFieldErrors } from '@/lib/validation-errors';
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
      const fieldErrors = mapFieldErrors(error.details);
      const display = resolveApiErrorDisplay({
        errorCategory: error.errorCategory,
        errorCode: error.errorCode,
        message: error.message,
      });
      const category = display.category ?? error.errorCategory ?? ERROR_CATEGORIES.SERVER;
      const validationDescription = validationToastDescription(fieldErrors);
      const hasMappedFields = hasFieldErrors(fieldErrors);

      if (
        category === ERROR_CATEGORIES.VALIDATION &&
        hasMappedFields
      ) {
        return { display, fieldErrors };
      }

      if (error.errorCode === ERROR_CODES.EMAIL_NOT_FOUND) {
        toast({
          title: display.title,
          description: display.description,
          variant: toastVariantForCategory(category),
          action: toastActionFor(display),
        });
        return { display, fieldErrors: {} };
      }

      const title =
        category === ERROR_CATEGORIES.VALIDATION && validationDescription
          ? 'Could not submit'
          : display.title;
      const description = validationDescription ?? display.description;

      toast({
        title,
        description,
        variant: toastVariantForCategory(category),
        action: toastActionFor(display),
      });
      return { display, fieldErrors };
    }

    if (error instanceof Error) {
      const display = resolveApiErrorDisplay({ message: error.message });
      toast({
        title: display.title,
        description: display.description,
        variant: toastVariantForCategory(display.category ?? ERROR_CATEGORIES.SERVER),
      });
      return { display, fieldErrors: {} };
    }

    const display = resolveApiErrorDisplay({});
    toast({
      title: display.title,
      description: display.description,
      variant: 'destructive',
    });
    return { display, fieldErrors: {} };
  }, [toast]);

  return { showError };
}
