import { Link } from "react-router-dom";
import cuddlesImage from "@/assets/cuddles.png";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-primary/20">
              <img src={cuddlesImage} alt="Cuddles" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="font-display font-semibold text-foreground">Cuddles</div>
              <div className="text-xs text-muted-foreground">AI-Powered Budtender</div>
            </div>
          </div>
          
          {/* Links */}
          <div className="flex flex-wrap justify-center gap-6">
            <Link 
              to="/privacy-policy" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors link-underline"
            >
              Privacy Policy
            </Link>
            <Link 
              to="/schedule-demo" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors link-underline"
            >
              Schedule Demo
            </Link>
            <a 
              href="https://tripplefourmarketplace.lovable.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors link-underline"
            >
              Marketplace
            </a>
          </div>

          {/* Copyright */}
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Cuddles
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
