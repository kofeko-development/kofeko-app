"use client";

import { ReactNode, forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import Script from "next/script";

declare global {
  interface Window {
    Calendly: any;
  }
}

export const BookDemoButton = forwardRef<
  HTMLElement,
  { children: ReactNode; className?: string; asChild?: boolean; onClick?: (e: any) => void }
>(({ children, className, asChild, onClick, ...props }, ref) => {
  const handleClick = (e: any) => {
    e.preventDefault();
    if (onClick) onClick(e);
    if (window.Calendly) {
      window.Calendly.initPopupWidget({
        url: "https://calendly.com/chirag-kofeko/30min",
      });
    }
  };

  const Comp = asChild ? Slot : "button";

  return (
    <>
      <link
        href="https://assets.calendly.com/assets/external/widget.css"
        rel="stylesheet"
      />
      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="lazyOnload"
      />
      <Comp
        ref={ref as any}
        onClick={handleClick}
        className={className}
        {...props}
      >
        {children}
      </Comp>
    </>
  );
});
BookDemoButton.displayName = "BookDemoButton";
