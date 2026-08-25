import { HeartHandshake } from "lucide-react";
import Link from "next/link";

export function FloatingDonateButton() {
  return (
    <Link
      href="/doar"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full bg-orange-500 px-5 py-3.5 text-sm font-bold text-white shadow-xl transition-all duration-300 hover:scale-105 hover:bg-orange-600 hover:shadow-2xl active:scale-95 sm:text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
      aria-label="Doe Agora para o SAR"
    >
      <HeartHandshake className="size-5 shrink-0 text-white" />
      <span>Doe Agora</span>
    </Link>
  );
}
