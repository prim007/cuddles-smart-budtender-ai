import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Camera, Upload, Sparkles, AlertCircle, Leaf, Loader2 } from "lucide-react";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { prepareImageForAnalysis } from "@/utils/imagePreprocessing";
import { trackScanStart, trackScanComplete, trackRecommendationView } from "@/components/GoogleAnalytics";

interface LabelOcr {
  has_text: boolean;
  raw_text: string;
  brand?: string;
  product_name?: string;
  batch_number?: string;
  lab_name?: string;
  test_date?: string;
  packaged_date?: string;
  expiry_date?: string;
  net_weight?: string;
  thc_percent?: string;
  cbd_percent?: string;
  total_cannabinoids?: string;
  terpenes?: string[];
  warnings?: string[];
  confidence: number;
}

interface StrainResult {
  strain_name: string;
  confidence: number;
  strain_type: string;
  characteristics: string[];
  thc_estimate?: string;
  cbd_estimate?: string;
  effects: string[];
  similar_strains: string[];
  description: string;
}


const StrainScanner = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<StrainResult | null>(null);
  const [disclaimer, setDisclaimer] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const preparedImage = await prepareImageForAnalysis(file);
      setImagePreview(preparedImage);
      setResult(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Please upload a valid image file.";
      toast({ title: "Invalid image", description: message, variant: "destructive" });
    }
  };

  const analyzeImage = async () => {
    if (!imagePreview) return;

    const { data: authData } = await supabase.auth.getSession();
    const accessToken = authData.session?.access_token;

    if (!accessToken) {
      toast({
        title: "Sign in required",
        description: "Please sign in before scanning so Cuddles can securely analyze your image.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    trackScanStart('upload');
    try {
      const { data, error } = await supabase.functions.invoke("identify-strain", {
        body: { imageBase64: imagePreview },
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (error) throw error;

      if (data.error) {
        toast({ title: "Analysis failed", description: data.error, variant: "destructive" });
        return;
      }

      setResult(data.data);
      setDisclaimer(data.disclaimer);

      if (data.data?.strain_name) {
        trackScanComplete(data.data.strain_name, data.data.confidence);
        trackRecommendationView('strain', data.data.strain_name, {
          confidence: data.data.confidence,
          strain_type: data.data.strain_type,
        });
      }


      // Save scan to history if user is logged in
      if (user && data.data) {
        await supabase.from("strain_scans").insert({
          user_id: user.id,
          identified_strain: data.data.strain_name,
          confidence_score: data.data.confidence,
          strain_details: data.data,
        });
      }
    } catch (error) {
      console.error("Error analyzing image:", error);
      toast({ title: "Error", description: "Failed to analyze image. Please try again.", variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "indica": return "bg-hippie-purple/20 text-hippie-purple border-hippie-purple/50";
      case "sativa": return "bg-hippie-orange/20 text-hippie-orange border-hippie-orange/50";
      case "hybrid": return "bg-hippie-green/20 text-hippie-green border-hippie-green/50";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <SEO
        title="Strain Scanner — Identify Cannabis with AI"
        description="Snap a photo of any cannabis bud and Cuddles AI identifies the strain, terpenes, THC range, and effects in seconds."
        url="/scanner"
        keywords="cannabis strain scanner, AI strain identifier, weed photo recognition, identify cannabis strain"
      />
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-hippie-pink/20">
        <div className="container mx-auto px-4 py-4">
          <Link to="/">
            <Button variant="ghost"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
          </Link>
        </div>
      </nav>

      <section className="pt-24 px-4">
        <div className="container mx-auto max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2 bg-gradient-to-r from-hippie-purple via-hippie-pink to-hippie-orange bg-clip-text text-transparent text-center">
            Strain Scanner 🔍
          </h1>
          <p className="text-center text-muted-foreground mb-8">
            Upload a photo to identify cannabis strains using AI
          </p>

          {/* Upload Area */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />

              {!imagePreview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-hippie-purple/30 rounded-xl p-12 text-center cursor-pointer hover:border-hippie-purple/50 transition-colors"
                >
                  <Camera className="w-16 h-16 mx-auto mb-4 text-hippie-purple/50" />
                  <h3 className="text-lg font-medium mb-2">Upload Cannabis Image</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Take a clear photo of the bud for best results
                  </p>
                  <Button className="bg-gradient-to-r from-hippie-purple to-hippie-pink">
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Image
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-xl overflow-hidden">
                    <img src={imagePreview} alt="Uploaded cannabis" className="w-full max-h-80 object-contain bg-black/5" />
                  </div>
                  {!user && (
                    <div className="rounded-lg border border-hippie-yellow/30 bg-hippie-yellow/10 p-3 text-sm text-muted-foreground">
                      Sign in to scan images securely and save your results.
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => { setImagePreview(null); setResult(null); }} className="flex-1">
                      Clear
                    </Button>
                    <Button
                      onClick={analyzeImage}
                      disabled={isAnalyzing || !user}
                      className="flex-1 bg-gradient-to-r from-hippie-purple to-hippie-pink"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Identify Strain
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results */}
          {result && (
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-hippie-purple/10 to-hippie-pink/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Leaf className="w-8 h-8 text-hippie-green" />
                    <div>
                      <CardTitle className="text-2xl font-display font-bold">{result.strain_name}</CardTitle>
                      <Badge className={getTypeColor(result.strain_type)}>{result.strain_type}</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {/* Confidence */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Confidence</span>
                    <span className="text-sm">{result.confidence}%</span>
                  </div>
                  <Progress value={result.confidence} className="h-2" />
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{result.description}</p>
                </div>

                {/* Characteristics */}
                {result.characteristics?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Visual Characteristics</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.characteristics.map((char, i) => (
                        <Badge key={i} variant="outline">{char}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Effects */}
                {result.effects?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Expected Effects</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.effects.map((effect, i) => (
                        <Badge key={i} className="bg-hippie-green/20 text-hippie-green border-hippie-green/50">{effect}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Estimates */}
                <div className="grid grid-cols-2 gap-4">
                  {result.thc_estimate && (
                    <div className="p-3 rounded-lg bg-hippie-orange/10">
                      <span className="text-sm text-muted-foreground">THC Estimate</span>
                      <p className="font-medium">{result.thc_estimate}</p>
                    </div>
                  )}
                  {result.cbd_estimate && (
                    <div className="p-3 rounded-lg bg-hippie-blue/10">
                      <span className="text-sm text-muted-foreground">CBD Estimate</span>
                      <p className="font-medium">{result.cbd_estimate}</p>
                    </div>
                  )}
                </div>

                {/* Similar Strains */}
                {result.similar_strains?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Similar Strains</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.similar_strains.map((strain, i) => (
                        <Badge key={i} variant="secondary">{strain}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Disclaimer */}
                {disclaimer && (
                  <div className="flex items-start gap-2 p-4 rounded-lg bg-hippie-yellow/10 border border-hippie-yellow/30">
                    <AlertCircle className="w-5 h-5 text-hippie-yellow flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">{disclaimer}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
};

export default StrainScanner;
