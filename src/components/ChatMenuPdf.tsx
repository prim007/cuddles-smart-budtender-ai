import { Button } from "@/components/ui/button";
import { ExternalLink, Download } from "lucide-react";

interface Props {
  url: string;
  label: string;
}

const ChatMenuPdf = ({ url, label }: Props) => {
  return (
    <div className="mt-3 rounded-xl overflow-hidden border border-border bg-background/60 shadow-soft">
      <div className="flex items-center justify-between gap-2 px-3 py-2 bg-muted/60">
        <p className="text-sm font-semibold text-foreground truncate">📄 {label}</p>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2 text-xs"
            onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
          >
            <ExternalLink className="w-3 h-3 mr-1" /> Open
          </Button>
          <a href={url} download>
            <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
              <Download className="w-3 h-3 mr-1" /> Save
            </Button>
          </a>
        </div>
      </div>
      <iframe
        src={url}
        title={label}
        className="w-full h-[420px] bg-white"
      />
      <noscript>
        <a href={url}>Open {label}</a>
      </noscript>
    </div>
  );
};

export default ChatMenuPdf;
