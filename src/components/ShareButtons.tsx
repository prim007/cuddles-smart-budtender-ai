import { Link2, MessageCircle, Facebook } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { facebookShareUrl, trackedUrl, whatsappShareUrl } from "@/lib/shareLinks";

interface ShareButtonsProps {
  path: string;
  campaign: string;
  text: string;
  className?: string;
}

const ShareButtons = ({ path, campaign, text, className }: ShareButtonsProps) => {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(trackedUrl(path, "copy", campaign));
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy the link");
    }
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className ?? ""}`}>
      <span className="text-sm text-muted-foreground mr-1">Share:</span>
      <Button asChild size="sm" variant="outline" className="gap-2">
        <a href={whatsappShareUrl(path, campaign, text)} target="_blank" rel="noopener noreferrer">
          <MessageCircle className="w-4 h-4" /> WhatsApp
        </a>
      </Button>
      <Button asChild size="sm" variant="outline" className="gap-2">
        <a href={facebookShareUrl(path, campaign)} target="_blank" rel="noopener noreferrer">
          <Facebook className="w-4 h-4" /> Facebook
        </a>
      </Button>
      <Button size="sm" variant="outline" className="gap-2" onClick={copy}>
        <Link2 className="w-4 h-4" /> Copy link
      </Button>
    </div>
  );
};

export default ShareButtons;
