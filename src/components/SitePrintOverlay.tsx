import ndebelePrint from "@/assets/ndebele-print.jpeg.asset.json";

/** Site-wide Ndebele print, softly blended over every page without blocking clicks. */
export default function SitePrintOverlay() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[60] opacity-[0.07] mix-blend-multiply dark:opacity-[0.05] dark:mix-blend-screen print:hidden"
      style={{ backgroundImage: `url(${ndebelePrint.url})`, backgroundSize: "225px 225px", backgroundRepeat: "repeat" }}
    />
  );
}
