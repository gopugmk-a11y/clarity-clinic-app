import { cn } from "@/lib/utils";
import * as React from "react";

export const Logo = (props: React.SVGProps<SVGSVGElement>) => (
  <div className={cn("grid place-items-center w-10 h-10 rounded-lg border border-border/50 bg-gradient-to-br from-cyan-500/20 via-transparent to-emerald-500/20", props.className)}>
    <svg 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="hsl(var(--primary))" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M12 2v20M2 12h20"/>
    </svg>
  </div>
);
