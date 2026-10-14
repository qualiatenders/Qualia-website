import type { SVGProps } from 'react';

export type IconName =
  | 'arrow-right' | 'arrow-up-right' | 'arrow-left' | 'upload' | 'file' | 'check' | 'plus' | 'minus' | 'x' | 'menu'
  | 'phone' | 'mail' | 'pin' | 'target' | 'gear' | 'shield' | 'globe' | 'drawing' | 'chevron-down' | 'lock' | 'info' | 'alert' | 'calendar' | 'layers';

const paths: Record<IconName, React.ReactNode> = {
  'arrow-right': <path d="M4 12h15m-6-6 6 6-6 6" />,
  'arrow-up-right': <path d="M7 17 17 7M8 7h9v9" />,
  'arrow-left': <path d="M20 12H5m6 6-6-6 6-6" />,
  upload: <><path d="M12 16V4m-5 5 5-5 5 5" /><path d="M4 15v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4" /></>,
  file: <><path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z" /><path d="M14 3v5h5" /></>,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  x: <path d="m6 6 12 12M18 6 6 18" />,
  menu: <path d="M4 7h16M4 12h16M4 17h10" />,
  phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1" />,
  mail: <><rect x="3" y="5" width="18" height="14" rx="1" /><path d="m3 7 9 6 9-6" /></>,
  pin: <><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></>,
  target: <><circle cx="12" cy="12" r="7" /><circle cx="12" cy="12" r="2.5" /><path d="M12 1.5v5M12 17.5v5M1.5 12h5M17.5 12h5" /></>,
  gear: <><circle cx="12" cy="12" r="3" /><circle cx="12" cy="12" r="6.5" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" /></>,
  shield: <><path d="M12 3 4.5 6v5.5c0 4.5 3.2 8.2 7.5 9.5 4.3-1.3 7.5-5 7.5-9.5V6z" /><path d="m8.5 12 2.5 2.5 4.5-5" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.8 2.6 4 5.6 4 9s-1.2 6.4-4 9c-2.8-2.6-4-5.6-4-9s1.2-6.4 4-9z" /></>,
  drawing: <><rect x="3" y="4" width="18" height="16" rx="1" /><path d="M7 15V9h6v6zM13 12h4M7 18h10" /><path d="M15 9.5h2" /></>,
  'chevron-down': <path d="m6 9 6 6 6-6" />,
  lock: <><rect x="5" y="10.5" width="14" height="10" rx="1" /><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7.5v.5" /></>,
  alert: <><path d="M12 3 2 20h20z" /><path d="M12 10v4.5M12 17.2v.3" /></>,
  calendar: <><rect x="3.5" y="5" width="17" height="15.5" rx="1" /><path d="M3.5 10h17M8 3v4M16 3v4" /></>,
  layers: <><path d="m12 3 9 5-9 5-9-5z" /><path d="m3 13 9 5 9-5" /></>,
};

export function Icon({ name, size = 20, strokeWidth = 1.6, ...rest }: { name: IconName; size?: number; strokeWidth?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true" focusable="false" {...rest}>
      {paths[name]}
    </svg>
  );
}
