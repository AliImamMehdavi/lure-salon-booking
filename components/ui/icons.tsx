import { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 20 20",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function ChevronLeftIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 4.5 6.5 10l5.5 5.5" />
    </svg>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="4.5" width="13" height="12" rx="1.5" />
      <path d="M3.5 8.5h13M7 3v3M13 3v3" />
    </svg>
  );
}

export function CheckCircleIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="10" cy="10" r="7" />
      <path d="M7 10.2l2 2 4-4.4" />
    </svg>
  );
}

export function DotIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 8 8" fill="currentColor" {...props}>
      <circle cx="4" cy="4" r="4" />
    </svg>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="10" cy="10" r="7" />
      <path d="M10 6v4l3 2" />
    </svg>
  );
}

export function UsersIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="7.5" cy="7.5" r="2.5" />
      <path d="M2.5 16c0-2.5 2.2-4 5-4s5 1.5 5 4" />
      <circle cx="14" cy="8" r="2" />
      <path d="M13 12.2c1.9.4 3.5 1.6 3.5 3.8" />
    </svg>
  );
}

export function SparklesIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path d="M10 2.5l1.4 4.1 4.1 1.4-4.1 1.4L10 13.5l-1.4-4.1-4.1-1.4 4.1-1.4L10 2.5z" />
      <path d="M16 12l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2z" opacity="0.6" />
    </svg>
  );
}

export function MapPinIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M10 17.5s6-5.2 6-9.5a6 6 0 10-12 0c0 4.3 6 9.5 6 9.5z" />
      <circle cx="10" cy="8" r="2" />
    </svg>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 3.5h2.5l1 3.5-1.7 1.3a9 9 0 004.9 4.9l1.3-1.7 3.5 1v2.5c0 .8-.7 1.5-1.5 1.4C8.7 15.9 4.1 11.3 3.6 5.9 3.5 5.1 4.2 4.4 5 4.4z" />
    </svg>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="4.5" width="14" height="11" rx="1.5" />
      <path d="M3.5 5.5l6.5 5 6.5-5" />
    </svg>
  );
}

export function ScissorsIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="5.5" cy="5.5" r="2" />
      <circle cx="5.5" cy="14.5" r="2" />
      <path d="M7.2 6.8 16.5 15M16.5 5 7.2 13.2" />
    </svg>
  );
}

export function StarIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path d="M10 2.5l2.2 5.1 5.5.5-4.2 3.6 1.3 5.4L10 14.2l-4.8 2.9 1.3-5.4L2.3 8.1l5.5-.5L10 2.5z" />
    </svg>
  );
}

export function XCircleIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="10" cy="10" r="7" />
      <path d="M7.5 7.5l5 5M12.5 7.5l-5 5" />
    </svg>
  );
}

export function DropIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M10 2.5s5.5 6.3 5.5 10a5.5 5.5 0 11-11 0c0-3.7 5.5-10 5.5-10z" />
    </svg>
  );
}

export function LeafIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 16c0-7 4-11.5 12-11.5C16 12.5 11.5 16 4 16z" />
      <path d="M4 16c2-3 4.5-5.5 8-8" />
    </svg>
  );
}
