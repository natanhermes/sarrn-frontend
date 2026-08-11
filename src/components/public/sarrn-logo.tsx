import Image from "next/image";

import logo from "../../../public/logo-sar.png";
import { cn } from "@/lib/utils";

export function SarrnLogo({
  className,
}: {
  className?: string;
  invert?: boolean;
}) {
  return (
    <Image
      src={logo}
      alt="SARRN — Serviço de Assistência Rural e Urbano"
      className={cn("h-8 w-auto md:h-14", className)}
      sizes="180px"
      priority
    />
  );
}
