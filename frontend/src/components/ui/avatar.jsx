"use client";

import * as React from "react";
import { cn } from "../../lib/utils";

const Avatar = React.forwardRef(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-visible rounded-full",
      className
    )}
    {...props}
  />
));
Avatar.displayName = "Avatar";

const AvatarImage = React.forwardRef(({ className, alt = "", ...props }, ref) => (
  <img
    ref={ref}
    alt={alt}
    className={cn("absolute inset-0 z-10 aspect-square h-full w-full rounded-full object-cover", className)}
    {...props}
  />
));
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = React.forwardRef(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-slate-700 text-xs font-bold text-white",
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = "AvatarFallback";

const AvatarBadge = React.forwardRef(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "absolute bottom-0 right-0 z-20 h-3 w-3 rounded-full ring-2 ring-white shadow-sm",
      className
    )}
    {...props}
  />
));
AvatarBadge.displayName = "AvatarBadge";

const AvatarGroup = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex -space-x-2", className)} {...props} />
));
AvatarGroup.displayName = "AvatarGroup";

const AvatarGroupCount = React.forwardRef(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-white bg-slate-800 text-xs font-bold text-white shadow-lg ring-1 ring-black/5",
      className
    )}
    {...props}
  />
));
AvatarGroupCount.displayName = "AvatarGroupCount";

export {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage
};
