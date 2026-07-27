import { memo } from "react";
import walker from "@/assets/cuddles-walker.png";

/**
 * Tiny ambient mascot that strolls back and forth along the bottom of the
 * viewport. Pure CSS transform animation (compositor-only, no JS per frame,
 * no re-renders) so it costs essentially nothing at runtime.
 */
const CuddlesWalker = () => (
  <div
    aria-hidden="true"
    className="pointer-events-none fixed bottom-0 left-0 z-30 hidden w-full overflow-hidden md:block"
    style={{ height: 76 }}
  >
    <div className="cuddles-walker absolute bottom-1 left-0">
      <img
        src={walker}
        alt=""
        width={56}
        height={64}
        loading="lazy"
        decoding="async"
        className="cuddles-bob h-16 w-auto opacity-80 drop-shadow-md"
      />
    </div>
  </div>
);

export default memo(CuddlesWalker);
