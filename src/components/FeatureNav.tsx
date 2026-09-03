import { Link, useLocation } from "react-router-dom";
import { MessageCircle, HelpCircle, Home, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { title: "Home", href: "/", icon: Home },
  { title: "Chat", href: "/ai-budtender", icon: MessageCircle },
  { title: "What is Cuddles", href: "/what-is-cuddles", icon: HelpCircle },
  { title: "Shop", href: "https://tripplefourshophub.online", icon: ShoppingBag, external: true },
];

const FeatureNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed left-1/2 top-4 z-50 hidden -translate-x-1/2 items-center gap-1 rounded-2xl border border-border/60 bg-card/95 px-2 py-2 shadow-soft backdrop-blur-md md:flex">
      {links.map(({ title, href, icon: Icon, external }) => {
        const active = href === "/" ? location.pathname === "/" : location.pathname === href;
        const className = cn(
          "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
          active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
        );
        const content = <><Icon className="h-4 w-4" /><span>{title}</span></>;

        return external ? (
          <a key={href} href={href} target="_blank" rel="noopener noreferrer" className={className}>{content}</a>
        ) : (
          <Link key={href} to={href} className={className}>{content}</Link>
        );
      })}
    </nav>
  );
};

export default FeatureNav;
