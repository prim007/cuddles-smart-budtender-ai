import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
  Newspaper,
  Store,
  Lightbulb,
  Sprout
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const features = [
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
    icon: Newspaper,
    title: "Blog",
    href: "/blog",
    gradient: "from-hippie-teal to-hippie-green",
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
  const { user } = useAuth();

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    if (href.startsWith("/#")) return location.pathname === "/" && location.hash === href.slice(1);
    return location.pathname === href;
  };

  return (
    <>
      {/* Mobile floating action button */}
      <div className="fixed bottom-6 right-6 z-50 md:hidden">
        <Button
          onClick={() => setIsOpen(!isOpen)}
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
        "fixed bottom-24 right-6 z-50 md:hidden transition-all duration-300 origin-bottom-right",
        isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
      )}>
        <div className="bg-card border border-border rounded-2xl p-4 shadow-elevated space-y-2">
          {features.map((feature) => (
            <Link
              key={feature.href}
              to={feature.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                isActive(feature.href)
                  ? "bg-gradient-to-r from-hippie-purple/10 to-hippie-pink/10 text-foreground"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br",
                feature.gradient
              )}>
                <feature.icon className="w-5 h-5 text-white" />
              </div>
              <span className="font-medium">{feature.title}</span>
            </Link>
          ))}
          
          {!user && (
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
          )}
        </div>
      </div>

      {/* Desktop top navigation bar */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-md border-b border-border px-4 py-2 shadow-elevated justify-center">
        {features.map((feature) => (
          <Link
            key={feature.href}
            to={feature.href}
            className={cn(
              "group flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200",
              isActive(feature.href)
                ? "bg-gradient-to-r from-hippie-purple/10 to-hippie-pink/10"
                : "hover:bg-muted"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110 bg-gradient-to-br",
              feature.gradient
            )}>
              <feature.icon className="w-5 h-5 text-white" />
            </div>
            <span className={cn(
              "text-xs font-medium transition-colors",
              isActive(feature.href) ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
            )}>
              {feature.title}
            </span>
          </Link>
        ))}
        
        {!user && (
          <Link
            to="/auth"
            className="group flex flex-col items-center gap-1 px-4 py-2 rounded-full transition-all duration-200 hover:bg-muted"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-hippie-amber to-hippie-orange transition-transform duration-200 group-hover:scale-110">
              <LogIn className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">
              Sign In
            </span>
          </Link>
        )}
      </nav>
    </>
  );
};

export default FeatureNav;
