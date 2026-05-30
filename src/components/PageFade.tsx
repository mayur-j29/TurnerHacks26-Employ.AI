"use client";

export function PageFade({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`page-enter ${className}`.trim()}>{children}</div>
  );
}
