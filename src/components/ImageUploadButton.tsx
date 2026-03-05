import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, X, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

interface ImageUploadButtonProps {
  onImageAnalysis: (analysis: string) => void;
  disabled?: boolean;
}

const ImageUploadButton = ({ onImageAnalysis, disabled }: ImageUploadButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: t.error,
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: t.error,
          description: "Image must be less than 5MB",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("identify-strain", {
        body: { imageBase64: selectedImage },
      });

      if (error) throw error;

      if (data.error) {
        toast({
          title: t.error,
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      const result = data.data;
      const disclaimer = data.disclaimer || "";

      // Build a rich description from the AI analysis
      let analysis = `🔍 **Strain Identified: ${result.strain_name}** (${result.confidence}% confidence)\n\n`;
      analysis += `**Type:** ${result.strain_type}\n\n`;
      
      if (result.description) {
        analysis += `${result.description}\n\n`;
      }

      if (result.characteristics?.length > 0) {
        analysis += `**Visual Traits:** ${result.characteristics.join(", ")}\n\n`;
      }

      if (result.thc_estimate) {
        analysis += `**THC Estimate:** ${result.thc_estimate}`;
        if (result.cbd_estimate) analysis += ` | **CBD Estimate:** ${result.cbd_estimate}`;
        analysis += `\n\n`;
      }

      if (result.effects?.length > 0) {
        analysis += `**Expected Effects:** ${result.effects.join(", ")}\n\n`;
      }

      if (result.similar_strains?.length > 0) {
        analysis += `**Similar Strains:** ${result.similar_strains.join(", ")}\n\n`;
      }

      if (disclaimer) {
        analysis += `⚠️ _${disclaimer}_`;
      }

      onImageAnalysis(analysis);
      setIsOpen(false);
      setSelectedImage(null);
      
      toast({
        title: "Image analyzed!",
        description: `Identified: ${result.strain_name} (${result.confidence}% confidence)`,
      });
    } catch (error) {
      console.error("Scan error:", error);
      toast({
        title: t.error,
        description: "Failed to analyze image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          disabled={disabled}
          className="bg-card/80 backdrop-blur-sm border-border hover:bg-accent"
          aria-label="Scan product"
        >
          <Camera className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Product Scanner
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Upload a photo of a cannabis product to get information about it. 
            Cuddles will analyze the image and provide educational insights.
          </p>

          {!selectedImage ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
            >
              <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, WEBP up to 5MB
              </p>
            </div>
          ) : (
            <div className="relative">
              <img
                src={selectedImage}
                alt="Selected product"
                className="w-full h-48 object-contain rounded-lg bg-muted"
              />
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-2 right-2"
                onClick={clearImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-hippie-purple via-hippie-pink to-hippie-orange text-white"
              onClick={handleAnalyze}
              disabled={!selectedImage || isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze Product"
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            📸 For best results, ensure the product label is clearly visible
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageUploadButton;
