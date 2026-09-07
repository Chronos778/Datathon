import React from "react";

export const Card = React.forwardRef(({ className = "", style = {}, ...props }, ref) => (
  <div
    ref={ref}
    className={`shadcn-card ${className}`}
    style={{ ...style }}
    {...props}
  />
));
Card.displayName = "Card";

export const CardHeader = React.forwardRef(({ className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={`shadcn-card-header ${className}`}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef(({ className = "", ...props }, ref) => (
  <h3
    ref={ref}
    className={`shadcn-card-title ${className}`}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef(({ className = "", ...props }, ref) => (
  <p
    ref={ref}
    className={`shadcn-card-description ${className}`}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef(({ className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={`shadcn-card-content ${className}`}
    {...props}
  />
));
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef(({ className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={`shadcn-card-footer ${className}`}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";
