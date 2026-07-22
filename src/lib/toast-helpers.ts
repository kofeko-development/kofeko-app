'use client';

import type { ReactElement, ReactNode } from 'react';
import { useCallback, useMemo } from 'react';
import { toast as baseToast } from '@/hooks/use-toast';

export type ToastInput = {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactElement;
};

export function toastSuccess(input: ToastInput) {
  return baseToast({ ...input, variant: 'success' });
}

export function toastWarning(input: ToastInput) {
  return baseToast({ ...input, variant: 'warning' });
}

export function toastError(input: ToastInput) {
  return baseToast({ ...input, variant: 'destructive' });
}

export function toastInfo(input: ToastInput) {
  return baseToast({ ...input, variant: 'info' });
}

export function useAppToast() {
  const toastSuccessFn = useCallback((input: ToastInput) => toastSuccess(input), []);
  const toastWarningFn = useCallback((input: ToastInput) => toastWarning(input), []);
  const toastErrorFn = useCallback((input: ToastInput) => toastError(input), []);
  const toastInfoFn = useCallback((input: ToastInput) => toastInfo(input), []);

  return useMemo(
    () => ({
      toast: baseToast,
      toastSuccess: toastSuccessFn,
      toastWarning: toastWarningFn,
      toastError: toastErrorFn,
      toastInfo: toastInfoFn,
    }),
    [toastSuccessFn, toastWarningFn, toastErrorFn, toastInfoFn],
  );
}
