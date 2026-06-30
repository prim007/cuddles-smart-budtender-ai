import ndebele1 from "@/assets/ndebele-1.webp.asset.json";
import ndebele2 from "@/assets/ndebele-2.webp.asset.json";
import ndebele3 from "@/assets/ndebele-3.webp.asset.json";

/**
 * Site-wide Ndebele cultural backdrop.
 * Fixed, behind all content. Glassy + 3D feel via low opacity, blur,
 * radial mask, perspective tilt and a glass sheen overlay.
 */
const NdebeleBackground = () => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{ perspective: "1400px" }}
    >
      {/* Colourful mural — main layer, tilted in 3D */}
      <div
        className="absolute -inset-[10%] opacity-[0.18] dark:opacity-[0.12] mix-blend-luminosity dark:mix-blend-screen"
        style={{
          backgroundImage: `url(${ndebele1.url})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          transform: "rotateX(8deg) rotateZ(-2deg) scale(1.15)",
          filter: "blur(1.5px) saturate(1.1)",
          maskImage:
            "radial-gradient(ellipse at center, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.55) 55%, transparent 85%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.55) 55%, transparent 85%)",
        }}
      />

      {/* Geometric mural layer — top right */}
      <div
        className="absolute -top-[20%] -right-[15%] w-[70%] h-[70%] opacity-[0.12] dark:opacity-[0.08]"
        style={{
          backgroundImage: `url(${ndebele2.url})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          transform: "rotateY(-12deg) rotateZ(3deg)",
          filter: "blur(2px) saturate(1.2)",
          maskImage:
            "radial-gradient(ellipse at center, black 0%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 0%, transparent 75%)",
        }}
      />

      {/* Heritage layer — bottom left */}
      <div
        className="absolute -bottom-[15%] -left-[10%] w-[65%] h-[65%] opacity-[0.10] dark:opacity-[0.07]"
        style={{
          backgroundImage: `url(${ndebele3.url})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          transform: "rotateY(10deg) rotateZ(-3deg)",
          filter: "blur(2.5px) saturate(1.15)",
          maskImage:
            "radial-gradient(ellipse at center, black 0%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 0%, transparent 75%)",
        }}
      />

      {/* Glass sheen — diagonal light wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, hsl(var(--background) / 0.55) 0%, hsl(var(--background) / 0.15) 35%, hsl(var(--background) / 0.05) 55%, hsl(var(--background) / 0.35) 85%, hsl(var(--background) / 0.75) 100%)",
          backdropFilter: "blur(4px) saturate(1.05)",
          WebkitBackdropFilter: "blur(4px) saturate(1.05)",
        }}
      />

      {/* Subtle highlight band — the "glass" reflection */}
      <div
        className="absolute inset-0 opacity-40 dark:opacity-20"
        style={{
          background:
            "linear-gradient(115deg, transparent 0%, transparent 38%, hsl(0 0% 100% / 0.08) 48%, hsl(0 0% 100% / 0.12) 50%, hsl(0 0% 100% / 0.08) 52%, transparent 62%, transparent 100%)",
        }}
      />

      {/* Vignette to ground the composition */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, hsl(var(--background) / 0.6) 100%)",
        }}
      />
    </div>
  );
};

export default NdebeleBackground;
