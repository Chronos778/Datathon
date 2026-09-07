import * as React from "react";

export const MinimalCard = React.forwardRef(
  ({ className = "", children, ...props }, ref) => (
    <div
      ref={ref}
      className={`minimal-card ${className}`}
      {...props}
    >
      {children}
    </div>
  )
);
MinimalCard.displayName = "MinimalCard";

export const MinimalCardTitle = React.forwardRef(
  ({ className = "", children, ...props }, ref) => (
    <h3
      ref={ref}
      className={`minimal-card-title ${className}`}
      {...props}
    >
      {children}
    </h3>
  )
);
MinimalCardTitle.displayName = "MinimalCardTitle";

export const MinimalCardDescription = React.forwardRef(
  ({ className = "", children, ...props }, ref) => (
    <p
      ref={ref}
      className={`minimal-card-description ${className}`}
      {...props}
    >
      {children}
    </p>
  )
);
MinimalCardDescription.displayName = "MinimalCardDescription";

export const MinimalCardContent = React.forwardRef(
  ({ className = "", children, ...props }, ref) => (
    <div
      ref={ref}
      className={`minimal-card-content ${className}`}
      {...props}
    >
      {children}
    </div>
  )
);
MinimalCardContent.displayName = "MinimalCardContent";
