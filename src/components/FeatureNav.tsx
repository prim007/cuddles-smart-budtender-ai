import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  BookOpen, 
  Camera, 
  Star, 
  Heart, 
  Menu, 
  X, 
  Home,
  MessageCircle,
  LogIn,
  LogOut,
  Newspaper,
  Store,
  Lightbulb,
  Sprout,
  ShoppingBag,
  Crown,
  Sparkles,
  Globe2,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface Feature {
  icon: typeof Home;
  title: string;
  href: string;
  gradient: string;
  external?: boolean;
}

const features: Feature[] = [
  {
    icon: Home,
    title: "Home",
    href: "/",
    gradient: "from-hippie-lavender to-hippie-purple",
  },
  {
    icon: Lightbulb,
    title: "Why Cuddles",
    href: "/why-cuddles",
    gradient: "from-hippie-amber to-hippie-orange",
  },
  {
    icon: MessageCircle,
    title: "Chat",
    href: "/#demo",
    gradient: "from-hippie-coral to-hippie-pink",
  },
  {
    icon: BookOpen,
    title: "Journal",
    href: "/journal",
    gradient: "from-hippie-purple to-hippie-lavender",
  },
  {
    icon: Camera,
    title: "Scanner",
    href: "/scanner",
    gradient: "from-hippie-pink to-hippie-coral",
  },
  {
    icon: Star,
    title: "Reviews",
    href: "/reviews",
    gradient: "from-hippie-orange to-hippie-amber",
  },
  {
    icon: Heart,
    title: "T-Break",
    href: "/t-break",
    gradient: "from-hippie-green to-hippie-teal",
  },
  {
    icon: Sprout,
    title: "Grow",
    href: "/grow",
    gradient: "from-hippie-green to-hippie-amber",
  },
  {
    icon: Globe2,
    title: "Africa Map",
    href: "/africa-cannabis-map",
    gradient: "from-hippie-green to-hippie-amber",
  },
  {
    icon: Sparkles,
    title: "Strains",
    href: "/strains/featured",
    gradient: "from-hippie-purple to-hippie-pink",
  },
  {
    icon: Newspaper,
    title: "Blog",
    href: "/blog",
    gradient: "from-hippie-teal to-hippie-green",
  },
  {
    icon: Crown,
    title: "Premium",
    href: "/premium",
    gradient: "from-hippie-amber to-hippie-orange",
  },
  {
    icon: ShoppingBag,
    title: "Shop",
    href: "https://tripplefourshophub.online",
    gradient: "from-hippie-coral to-hippie-orange",
    external: true,
  },
  {
    icon: Store,
    title: "Dispensaries",
    href: "/dispensary-onboarding",
    gradient: "from-hippie-amber to-hippie-coral",
  },
];

const FeatureNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    if (href.startsWith("/#")) return location.pathname === "/" && location.hash === href.slice(1);
    return location.pathname === href;
  };

  return (
    <>
      {/* Mobile floating action button */}
      <div className="fixed bottom-6 left-6 z-[9998] md:hidden">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          className={cn(
            "w-14 h-14 rounded-full shadow-elevated transition-all duration-300",
            isOpen 
              ? "bg-muted text-foreground" 
              : "bg-gradient-to-br from-hippie-purple to-hippie-pink text-white"
          )}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </div>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile menu */}
      <div className={cn(
        "fixed bottom-24 left-6 z-[9998] md:hidden transition-all duration-300 origin-bottom-left",
        isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
      )}>
        <div className="bg-card border border-border rounded-2xl p-4 shadow-elevated space-y-2">
          {features.map((feature) => {
            const content = (
              <>
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br",
                  feature.gradient
                )}>
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium">{feature.title}</span>
              </>
            );
            const cls = cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
              isActive(feature.href)
                ? "bg-gradient-to-r from-hippie-purple/10 to-hippie-pink/10 text-foreground"
                : "hover:bg-muted text-muted-foreground hover:text-foreground"
            );
            return feature.external ? (
              <a key={feature.href} href={feature.href} target="_blank" rel="noopener noreferrer" onClick={() => setIsOpen(false)} className={cls}>
                {content}
              </a>
            ) : (
              <Link key={feature.href} to={feature.href} onClick={() => setIsOpen(false)} className={cls}>
                {content}
              </Link>
            );
          })}
          
          {!user ? (
            <Link
              to="/auth"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-hippie-purple/30 hover:bg-hippie-purple/5 transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-hippie-amber to-hippie-orange">
                <LogIn className="w-5 h-5 text-white" />
              </div>
              <span className="font-medium">Sign In</span>
            </Link>
          ) : (
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-hippie-coral/30 hover:bg-hippie-coral/5 transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-hippie-coral to-hippie-pink">
                <LogOut className="w-5 h-5 text-white" />
              </div>
              <span className="font-medium">Sign Out</span>
            </button>
          )}
        </div>
      </div>

      {/* Desktop top navigation bar — compact pill nav */}
      <nav className="hidden md:flex fixed top-4 left-1/2 -translate-x-1/2 z-50 px-3 py-2 rounded-3xl border border-white/10 bg-card/60 backdrop-blur-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] items-center gap-1">
        {(() => {
          const primary = features.filter(f => ["Home", "Chat", "Strains", "Journal", "Shop"].includes(f.title));
          const overflow = features.filter(f => !["Home", "Chat", "Strains", "Journal", "Shop"].includes(f.title));
          return (
            <>
              {primary.map((feature) => {
                const active = isActive(feature.href);
                const cls = cn(
                  "px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200 flex items-center gap-2",
                  active
                    ? "bg-gradient-to-br text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_4px_12px_rgba(0,0,0,0.25)] " + feature.gradient
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                );
                const content = (
                  <>
                    <feature.icon className="w-4 h-4" />
                    <span>{feature.title}</span>
                  </>
                );
                return feature.external ? (
                  <a key={feature.href} href={feature.href} target="_blank" rel="noopener noreferrer" className={cls}>
                    {content}
                  </a>
                ) : (
                  <Link key={feature.href} to={feature.href} className={cls}>
                    {content}
                  </Link>
                );
              })}

              <div className="h-5 w-px bg-white/10 mx-1" />

              <DropdownMenu>
                <DropdownMenuTrigger className="px-3 py-2 rounded-2xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all flex items-center gap-1.5 focus:outline-none">
                  More
                  <ChevronDown className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl border-white/10 bg-card/95 backdrop-blur-xl">
                  {overflow.map((feature) => {
                    const inner = (
                      <>
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br shrink-0",
                          feature.gradient
                        )}>
                          <feature.icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-medium">{feature.title}</span>
                      </>
                    );
                    return (
                      <DropdownMenuItem key={feature.href} asChild className="gap-3 cursor-pointer rounded-xl py-2">
                        {feature.external ? (
                          <a href={feature.href} target="_blank" rel="noopener noreferrer">{inner}</a>
                        ) : (
                          <Link to={feature.href}>{inner}</Link>
                        )}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="h-5 w-px bg-white/10 mx-1" />

              {!user ? (
                <Link
                  to="/auth"
                  className="whitespace-nowrap px-4 py-2 rounded-2xl text-sm font-semibold bg-gradient-to-br from-hippie-coral to-hippie-peach text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),0_6px_16px_-4px_hsl(var(--hippie-coral)/0.5)] hover:scale-[1.03] transition-transform flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Link>
              ) : (
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 rounded-2xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              )}
            </>
          );
        })()}
      </nav>

    </>
  );
};

export default FeatureNav;
