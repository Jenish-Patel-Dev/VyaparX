import React from 'react';

export interface TapIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

/**
 * TapIcon - Custom vector icon representing the exact finger tap gesture with
 * an arc ripple over the fingertip, matching the user design specification.
 */
export const TapIcon: React.FC<TapIconProps> = ({
  size = 14,
  className = '',
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 28 38"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Tap Ripple Arc above fingertip */}
      <path d="M4 8a8 8 0 0 1 16 0" />
      {/* Index Finger */}
      <path d="M9 20V7a2.2 2.2 0 0 1 4.4 0v4" />
      {/* Middle Finger Fold */}
      <path d="M13.4 11a2 2 0 0 1 4 0v5" />
      {/* Ring Finger Fold */}
      <path d="M17.4 14a2 2 0 0 1 4 0v4" />
      {/* Pinky Finger Fold and Outer Edge */}
      <path d="M21.4 17a2 2 0 0 1 4 0v13" />
      {/* Wrist Curve & Thumb */}
      <path d="M25.4 30c0 4.5-4 7-9.4 7s-8-2-10-5l-4-4.5a2 2 0 0 1 2.8-2.8l3.2 2.3V20" />
      {/* Finger Creases */}
      <path d="M13.4 13v5" />
      <path d="M17.4 16v4" />
    </svg>
  );
};
