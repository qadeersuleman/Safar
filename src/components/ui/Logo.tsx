import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function Logo({
  variant = "compact",
  className,
  priority,
}: {
  variant?: "compact" | "full";
  className?: string;
  priority?: boolean;
}) {
  const full = variant === "full";
  return (
    <Link href="/" aria-label="SafarGo home" className={cn("inline-flex shrink-0 items-center", className)}>
      <Image
        src={full ? "/brand/logo-full.png" : "/brand/logo-compact.png"}
        alt="SafarGo"
        width={full ? 550 : 444}
        height={full ? 170 : 138}
        priority={priority}
        className={full ? "h-24 w-auto" : "h-10 w-auto sm:h-11"}
      />
    </Link>
  );
}
