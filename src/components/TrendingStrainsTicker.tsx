import { TrendingUp, Flame } from "lucide-react";

const TRENDING = [
  { name: "Durban Poison", type: "Sativa", effect: "Energizing" },
  { name: "Wedding Cake", type: "Hybrid", effect: "Relaxing" },
  { name: "Blue Dream", type: "Hybrid", effect: "Creative" },
  { name: "Granddaddy Purple", type: "Indica", effect: "Sleepy" },
  { name: "Jack Herer", type: "Sativa", effect: "Focused" },
  { name: "OG Kush", type: "Hybrid", effect: "Euphoric" },
  { name: "Gelato", type: "Hybrid", effect: "Happy" },
  { name: "Amnesia Haze", type: "Sativa", effect: "Uplifting" },
];

const TrendingStrainsTicker = () => {
  // Duplicate for seamless loop
  const items = [...TRENDING, ...TRENDING];

  return (
    <section className="py-4 bg-primary/5 border-y border-primary/10 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-2">
          <Flame className="h-4 w-4 text-orange-500" />
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Trending Now
          </span>
        </div>
      </div>
      <div className="relative">
        <div className="flex animate-scroll-x gap-4 whitespace-nowrap">
          {items.map((strain, i) => (
            <a
              key={`${strain.name}-${i}`}
              href={`/strains/${strain.name.toLowerCase().replace(/\s+/g, "-")}`}
              className="inline-flex items-center gap-2 bg-card border border-border rounded-full px-4 py-1.5 shadow-sm hover:border-primary/40 transition-colors shrink-0"
            >
              <TrendingUp className="h-3 w-3 text-primary" />
              <span className="text-sm font-medium text-foreground">{strain.name}</span>
              <span className="text-[10px] bg-primary/10 text-primary rounded-full px-2 py-0.5 font-medium">
                {strain.effect}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingStrainsTicker;
