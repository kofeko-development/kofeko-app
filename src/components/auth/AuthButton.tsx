import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface AuthButtonProps extends ButtonProps {
  isLoading?: boolean;
}

export function AuthButton({ children, isLoading, className = '', ...props }: AuthButtonProps) {
  return (
    <Button 
      className={`w-full rounded-xl h-12 font-bold text-base shadow-md transition-all hover:shadow-lg ${className}`} 
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="size-5 animate-spin mr-2" />
      ) : null}
      {children}
    </Button>
  );
}
