import Image from "next/image";

interface OnwyndLogoProps {
  variant?: "horizontal" | "icon";
  width?: number;
  height?: number;
  className?: string;
}

/**
 * Onwynd brand logo.
 * - variant="horizontal" → /LOGO.SVG (150×36, for sidebar headers, nav, invoices)
 * - variant="icon"       → /images/icons/icon-96x96.png (square, for collapsed sidebar, favicon fallback)
 */
export function OnwyndLogo({
  variant = "horizontal",
  width,
  height,
  className,
}: OnwyndLogoProps) {
  if (variant === "icon") {
    return (
      <Image
        src="/images/icons/icon-96x96.png"
        alt="Onwynd"
        width={width ?? 32}
        height={height ?? 32}
        className={className}
        priority
      />
    );
  }

  return (
    <Image
      src="/LOGO.SVG"
      alt="Onwynd"
      width={width ?? 120}
      height={height ?? 29}
      className={className}
      priority
    />
  );
}
