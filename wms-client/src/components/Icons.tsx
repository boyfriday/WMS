import React from 'react';

export interface IconProps {
  size?: number | string;
  className?: string;
}

const svgProps = (size: number | string, className?: string) => ({
  xmlns: 'http://www.w3.org/2000/svg',
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  className,
});

export const Package: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg {...svgProps(size, className)}>
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="m3.3 7 8.7 5 8.7-5" />
    <path d="M12 22V12" />
  </svg>
);

export const Layers: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg {...svgProps(size, className)}>
    <path d="m12 3-10 5 10 5 10-5-10-5Z" />
    <path d="m2 17 10 5 10-5" />
    <path d="m2 12 10 5 10-5" />
  </svg>
);

export const ShoppingBag: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg {...svgProps(size, className)}>
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
    <path d="M3 6h18" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

export const ShieldCheck: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg {...svgProps(size, className)}>
    <path d="M20 13c0 5-3.5 7.5-7.66 9.7a1 1 0 0 1-.68 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 .76-.97l8-2a1 1 0 0 1 .48 0l8 2A1 1 0 0 1 20 6Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const LogOut: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg {...svgProps(size, className)}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" x2="9" y1="12" y2="12" />
  </svg>
);

export const LayoutDashboard: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg {...svgProps(size, className)}>
    <rect width="7" height="9" x="3" y="3" rx="1" />
    <rect width="7" height="5" x="14" y="3" rx="1" />
    <rect width="7" height="9" x="14" y="12" rx="1" />
    <rect width="7" height="5" x="3" y="16" rx="1" />
  </svg>
);

export const TrendingUp: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg {...svgProps(size, className)}>
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);

export const AlertTriangle: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg {...svgProps(size, className)}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" x2="12" y1="9" y2="13" />
    <line x1="12" x2="12.01" y1="17" y2="17" />
  </svg>
);

export const ClipboardList: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg {...svgProps(size, className)}>
    <rect width="8" height="4" x="8" y="2" rx="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <path d="M12 11h4" />
    <path d="M12 16h4" />
    <path d="M8 11h.01" />
    <path d="M8 16h.01" />
  </svg>
);

export const PlusCircle: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg {...svgProps(size, className)}>
    <circle cx="12" cy="12" r="10" />
    <path d="M8 12h8" />
    <path d="M12 8v8" />
  </svg>
);

export const ArrowRight: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg {...svgProps(size, className)}>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

export const Plus: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg {...svgProps(size, className)}>
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);

export const X: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg {...svgProps(size, className)}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

export const Search: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg {...svgProps(size, className)}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

export const Filter: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg {...svgProps(size, className)}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

export const Edit2: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg {...svgProps(size, className)}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

export const Trash2: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg {...svgProps(size, className)}>
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" x2="10" y1="11" y2="17" />
    <line x1="14" x2="14" y1="11" y2="17" />
  </svg>
);

export const AlertCircle: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg {...svgProps(size, className)}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" x2="12" y1="8" y2="12" />
    <line x1="12" x2="12.01" y1="16" y2="16" />
  </svg>
);

export const Boxes: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg {...svgProps(size, className)}>
    <path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0Z" />
    <path d="m12 13.5 3-1.8a2 2 0 0 0 .97-1.71V6.75a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8A2 2 0 0 0 6 6.75v3.24a2 2 0 0 0 .97 1.71Z" />
    <path d="M12.97 12.92a2 2 0 0 0-.97 1.71v3.24c0 .7.37 1.3 1 1.7l3 1.8a2 2 0 0 0 2 0l3-1.8a2 2 0 0 0 1-1.7v-3.2c0-.7-.3-1.3-1-1.7l-3-1.8a2 2 0 0 0-2 0Z" />
  </svg>
);

export const FolderPlus: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg {...svgProps(size, className)}>
    <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
    <line x1="12" x2="12" y1="10" y2="16" />
    <line x1="9" x2="15" y1="13" y2="13" />
  </svg>
);

export const Bookmark: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg {...svgProps(size, className)}>
    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z" />
  </svg>
);

export const ShoppingCart: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg {...svgProps(size, className)}>
    <circle cx="8" cy="21" r="1" />
    <circle cx="19" cy="21" r="1" />
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
  </svg>
);

export const Minus: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg {...svgProps(size, className)}>
    <path d="M5 12h14" />
  </svg>
);

export const Check: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg {...svgProps(size, className)}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const Calendar: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg {...svgProps(size, className)}>
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
);

export const Truck: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg {...svgProps(size, className)}>
    <rect width="7" height="11" x="14" y="5" rx="2" />
    <path d="M14 15H2a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h12v10Z" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="16.5" cy="18.5" r="2.5" />
  </svg>
);

export const CheckCircle2: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg {...svgProps(size, className)}>
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const Hourglass: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg {...svgProps(size, className)}>
    <path d="M5 2h14" />
    <path d="M5 22h14" />
    <path d="M19 2v4c0 1.38-1.13 2.5-2.5 2.5S14 7.38 14 6V2" />
    <path d="M14 22v-4c0-1.38 1.13-2.5 2.5-2.5s2.5 1.12 2.5 2.5v4" />
    <path d="M12 12a1.5 1.5 0 0 0 0-3" />
    <path d="M12 12a1.5 1.5 0 0 0 0 3" />
  </svg>
);

export const Receipt: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg {...svgProps(size, className)}>
    <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
    <path d="M16 8H8" />
    <path d="M16 12H8" />
    <path d="M13 16H8" />
  </svg>
);

export const Tag: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg {...svgProps(size, className)}>
    <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l5.58-5.58c.94-.94.94-2.48 0-3.42Z" />
    <line x1="7" x2="7.01" y1="7" y2="7" />
  </svg>
);

export const Mail: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg {...svgProps(size, className)}>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

export const Lock: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg {...svgProps(size, className)}>
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export const LogIn: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg {...svgProps(size, className)}>
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <polyline points="10 17 15 12 10 7" />
    <line x1="15" x2="3" y1="12" y2="12" />
  </svg>
);

export const Loader2: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg {...svgProps(size, className)}>
    <path d="M21 12a9 9 0 1 1-6.21-8.56" />
  </svg>
);

export const User: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg {...svgProps(size, className)}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const UserPlus: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg {...svgProps(size, className)}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="19" x2="19" y1="8" y2="14" />
    <line x1="16" x2="22" y1="11" y2="11" />
  </svg>
);
