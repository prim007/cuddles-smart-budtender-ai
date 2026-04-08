import { Star, Shield, Award, Users } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Thabo M.",
    location: "Cape Town, SA",
    text: "Cuddles found me the perfect strain for my insomnia in seconds. I've been sleeping like a baby ever since. 🙏",
    rating: 5,
    avatar: "TM",
  },
  {
    name: "Sarah K.",
    location: "Johannesburg, SA",
    text: "Finally an AI that actually understands terpenes. The recommendations are spot on every single time.",
    rating: 5,
    avatar: "SK",
  },
  {
    name: "James R.",
    location: "Durban, SA",
    text: "I switched from guessing at the dispensary to using Cuddles. My sessions have never been better.",
    rating: 5,
    avatar: "JR",
  },
];

const TRUST_BADGES = [
  { icon: Shield, label: "Private & Secure", desc: "No data sold" },
  { icon: Award, label: "AI-Powered", desc: "2,400+ strains" },
  { icon: Users, label: "2,400+ Users", desc: "Growing daily" },
];

const Testimonials = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
            Loved by Cannabis Enthusiasts 🌿
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Real users sharing their Cuddles experience
          </p>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          {TRUST_BADGES.map((badge) => (
            <div
              key={badge.label}
              className="flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2 shadow-sm"
            >
              <badge.icon className="h-4 w-4 text-primary" />
              <div>
                <span className="text-sm font-semibold text-foreground">{badge.label}</span>
                <span className="text-xs text-muted-foreground ml-1">· {badge.desc}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm text-foreground mb-4 leading-relaxed">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
