export interface LikesProfile {
  user_id: string;
  display_name: string;
  liked_effects: string[];
  liked_flavours: string[];
  liked_topics: string[];
  favourite_strains: string[];
}

const norm = (a: string[] = []) => new Set(a.map((x) => x.trim().toLowerCase()).filter(Boolean));

/** Shared likes between two people, across every like category. */
export const sharedLikes = (a: LikesProfile, b: LikesProfile): string[] => {
  const out: string[] = [];
  (["liked_effects", "liked_flavours", "liked_topics", "favourite_strains"] as const).forEach((k) => {
    const bs = norm(b[k]);
    (a[k] ?? []).forEach((v) => {
      if (bs.has(v.trim().toLowerCase()) && !out.includes(v)) out.push(v);
    });
  });
  return out;
};

/** People who share at least one like, best match first, excluding yourself and excluded ids. */
export const rankMatches = (me: LikesProfile, others: LikesProfile[], exclude: Set<string> = new Set()) =>
  others
    .filter((o) => o.user_id !== me.user_id && !exclude.has(o.user_id))
    .map((o) => ({ profile: o, shared: sharedLikes(me, o) }))
    .filter((m) => m.shared.length > 0)
    .sort((x, y) => y.shared.length - x.shared.length);
