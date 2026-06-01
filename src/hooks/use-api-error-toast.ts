import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ApiError } from '@/lib/api-client';
import { getErrorDisplay } from '@/lib/error-messages';

export function useApiErrorToast() {
  const { toast } = useToast();

  const showError = useCallback((error: unknown) => {
    if (error instanceof ApiError) {
      const display = getErrorDisplay(error.errorCode, error.message);
      toast({
        title: display.title,
        description: display.description,
        variant: 'destructive',
      });
      return display;
    }
    toast({
      title: 'Error',
      description: error instanceof Error ? error.message : 'Something went wrong.',
      variant: 'destructive',
    });
    return null;
  }, [toast]);

  return { showError };
}
