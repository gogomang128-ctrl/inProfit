interface LogoProps {
  size?: number;
  className?: string;
}

/** شعار inProfit المستخدم في شريط الموقع وشاشات الدخول. */
export default function Logo({ size = 48, className = "" }: LogoProps) {
  return (
    <img
      src="/images/inprofit-logo.png"
      alt="inProfit"
      width={size}
      height={size}
      className={className}
      style={{ objectFit: "contain" }}
      draggable={false}
    />
  );
}
