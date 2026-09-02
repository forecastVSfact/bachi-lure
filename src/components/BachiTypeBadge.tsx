import Link from "next/link";
import { BACHI_TYPE_LABEL } from "@/lib/constants";
import { getBachiPagePath } from "@/lib/bachi-pages";

export function BachiTypeBadge({ type, linked = false }: { type: string; linked?: boolean }) {
  const label = BACHI_TYPE_LABEL[type] ?? type;
  const href = linked ? getBachiPagePath(type) : null;
  const className = "badge-bachi rounded px-2 py-1";

  if (href) {
    return (
      <Link href={href} className={`${className} hover:opacity-80`}>
        {label}
      </Link>
    );
  }

  return <span className={className}>{label}</span>;
}
