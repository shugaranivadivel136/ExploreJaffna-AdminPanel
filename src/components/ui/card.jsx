import * as React from "react";
import { cn } from "@/lib/utils";

// Card component
function Card({ className, ...props }) {
  return (
    <div
      className={cn("rounded-lg border bg-white shadow-sm", className)}
      {...props}
    />
  );
}

// CardHeader component
function CardHeader({ className, ...props }) {
  return (
    <div className={cn("p-4 border-b", className)} {...props} />
  );
}

// CardContent component
function CardContent({ className, ...props }) {
  return (
    <div className={cn("p-4", className)} {...props} />
  );
}

// ✅ CardTitle component
function CardTitle({ className, ...props }) {
  return (
    <h2 className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
  );
}


export { Card, CardHeader, CardContent, CardTitle };

