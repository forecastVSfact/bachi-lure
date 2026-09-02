import { BachiTypeLuresPage } from "@/components/BachiTypeLuresPage";
import { BACHI_PAGE_CONFIGS } from "@/lib/bachi-pages";
import { getLures } from "@/lib/data";
import { createMetadata } from "@/lib/seo";

const config = BACHI_PAGE_CONFIGS.find((c) => c.slug === "river")!;

export const metadata = createMetadata({
  title: config.title,
  description: config.description,
  path: `/lures/${config.slug}`
});

export default async function RiverLuresPage() {
  const lures = await getLures({ bachi: config.bachiType });
  return <BachiTypeLuresPage config={config} lures={lures} />;
}
