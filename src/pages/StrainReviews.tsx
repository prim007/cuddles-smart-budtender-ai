import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Star, Search, ThumbsUp, User, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Review {
  id: string;
  strain_name: string;
  strain_type: string | null;
  rating: number;
  title: string;
  review_text: string;
  effects: string[];
  pros: string[] | null;
  cons: string[] | null;
  helpful_count: number;
  created_at: string;
  verified_purchase?: boolean;
}

const EFFECTS_OPTIONS = [
  "Relaxed", "Euphoric", "Happy", "Creative", "Focused", "Energetic",
  "Sleepy", "Hungry", "Uplifted", "Talkative", "Pain Relief", "Stress Relief"
];

const StrainReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEffects, setSelectedEffects] = useState<string[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    strain_name: "",
    strain_type: "hybrid",
    rating: 5,
    title: "",
    review_text: "",
    pros: "",
    cons: "",
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      // Use the public view that doesn't expose user_id for privacy
      const { data, error } = await supabase
        .from("strain_reviews_public" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      const reviewsData = ((data || []) as unknown) as Array<{
        id: string;
        strain_name: string;
        strain_type: string | null;
        rating: number;
        title: string;
        review_text: string;
        effects: unknown[];
        pros: string[] | null;
        cons: string[] | null;
        helpful_count: number;
        verified_purchase: boolean | null;
        created_at: string;
      }>;
      
      setReviews(reviewsData.map(r => ({ 
        ...r, 
        effects: Array.isArray(r.effects) ? (r.effects as string[]) : [] 
      })));
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Please sign in", description: "You need to be signed in to write reviews.", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase.from("strain_reviews").insert({
        user_id: user.id,
        strain_name: formData.strain_name.trim(),
        strain_type: formData.strain_type,
        rating: formData.rating,
        title: formData.title.trim(),
        review_text: formData.review_text.trim(),
        effects: selectedEffects,
        pros: formData.pros ? formData.pros.split(",").map(p => p.trim()).filter(Boolean) : null,
        cons: formData.cons ? formData.cons.split(",").map(c => c.trim()).filter(Boolean) : null,
      });

      if (error) throw error;

      toast({ title: "Review published! 🎉", description: "Thanks for sharing your experience." });
      setIsDialogOpen(false);
      setFormData({ strain_name: "", strain_type: "hybrid", rating: 5, title: "", review_text: "", pros: "", cons: "" });
      setSelectedEffects([]);
      fetchReviews();
    } catch (error) {
      toast({ title: "Error", description: "Failed to publish review. Please try again.", variant: "destructive" });
    }
  };

  const markHelpful = async (reviewId: string) => {
    try {
      const review = reviews.find(r => r.id === reviewId);
      if (!review) return;

      // Use secure RPC function to prevent direct table manipulation
      const { error } = await supabase.rpc('increment_review_helpful', {
        p_review_id: reviewId
      });

      if (error) throw error;

      setReviews(reviews.map(r =>
        r.id === reviewId ? { ...r, helpful_count: r.helpful_count + 1 } : r
      ));
    } catch (error) {
      console.error("Error marking helpful:", error);
    }
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.strain_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || review.strain_type === filterType;
    return matchesSearch && matchesType;
  });

  const getTypeColor = (type: string | null) => {
    switch (type) {
      case "indica": return "bg-hippie-purple/20 text-hippie-purple";
      case "sativa": return "bg-hippie-orange/20 text-hippie-orange";
      case "hybrid": return "bg-hippie-green/20 text-hippie-green";
      default: return "bg-muted";
    }
  };

  // Get trending strains
  const trendingStrains = [...new Set(reviews.map(r => r.strain_name))]
    .slice(0, 5)
    .map(name => ({
      name,
      count: reviews.filter(r => r.strain_name === name).length,
      avgRating: reviews.filter(r => r.strain_name === name).reduce((sum, r) => sum + r.rating, 0) /
        reviews.filter(r => r.strain_name === name).length
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="min-h-screen pb-20">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-hippie-pink/20">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/">
            <Button variant="ghost"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
          </Link>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-hippie-purple to-hippie-pink">
                <Plus className="w-4 h-4 mr-2" />Write Review
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-groovy text-xl">Write a Strain Review</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Strain Name *</Label>
                  <Input value={formData.strain_name} onChange={e => setFormData(p => ({ ...p, strain_name: e.target.value }))} required placeholder="e.g., OG Kush" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Strain Type</Label>
                    <Select value={formData.strain_type} onValueChange={v => setFormData(p => ({ ...p, strain_type: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="indica">Indica</SelectItem>
                        <SelectItem value="sativa">Sativa</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Your Rating</Label>
                    <div className="flex gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map(n => (
                        <Button key={n} type="button" size="sm" variant="ghost" onClick={() => setFormData(p => ({ ...p, rating: n }))}>
                          <Star className={`w-6 h-6 ${n <= formData.rating ? "fill-hippie-yellow text-hippie-yellow" : "text-muted-foreground"}`} />
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Review Title *</Label>
                  <Input value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} required placeholder="Sum up your experience" />
                </div>
                <div>
                  <Label>Your Review *</Label>
                  <Textarea value={formData.review_text} onChange={e => setFormData(p => ({ ...p, review_text: e.target.value }))} required placeholder="Share your experience..." rows={4} />
                </div>
                <div>
                  <Label>Effects Experienced</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {EFFECTS_OPTIONS.map(effect => (
                      <Badge key={effect} variant={selectedEffects.includes(effect) ? "default" : "outline"} className="cursor-pointer" onClick={() => setSelectedEffects(p => p.includes(effect) ? p.filter(e => e !== effect) : [...p, effect])}>{effect}</Badge>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Pros (comma-separated)</Label>
                    <Input value={formData.pros} onChange={e => setFormData(p => ({ ...p, pros: e.target.value }))} placeholder="Great taste, smooth" />
                  </div>
                  <div>
                    <Label>Cons (comma-separated)</Label>
                    <Input value={formData.cons} onChange={e => setFormData(p => ({ ...p, cons: e.target.value }))} placeholder="Dry mouth, expensive" />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-hippie-purple to-hippie-pink">Publish Review</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </nav>

      <section className="pt-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl md:text-4xl font-groovy mb-6 bg-gradient-to-r from-hippie-purple via-hippie-pink to-hippie-orange bg-clip-text text-transparent">
            Community Reviews ⭐
          </h1>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              {/* Search */}
              <Card>
                <CardContent className="pt-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search strains..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
                  </div>
                </CardContent>
              </Card>

              {/* Filters */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Filter by Type</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {["all", "indica", "sativa", "hybrid"].map(type => (
                    <Button key={type} variant={filterType === type ? "default" : "ghost"} size="sm" className="w-full justify-start capitalize" onClick={() => setFilterType(type)}>
                      {type === "all" ? "All Types" : type}
                    </Button>
                  ))}
                </CardContent>
              </Card>

              {/* Trending */}
              {trendingStrains.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Trending Strains
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {trendingStrains.map(strain => (
                      <button key={strain.name} onClick={() => setSearchTerm(strain.name)} className="w-full text-left p-2 rounded-lg hover:bg-muted transition-colors">
                        <div className="font-medium text-sm">{strain.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <span>{strain.count} reviews</span>
                          <span className="flex items-center"><Star className="w-3 h-3 fill-hippie-yellow text-hippie-yellow mr-1" />{strain.avgRating.toFixed(1)}</span>
                        </div>
                      </button>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Reviews List */}
            <div className="lg:col-span-3">
              {loading ? (
                <div className="text-center py-8">Loading reviews...</div>
              ) : filteredReviews.length === 0 ? (
                <Card className="text-center py-12">
                  <Star className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No reviews found</h3>
                  <p className="text-muted-foreground">Be the first to share your experience!</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredReviews.map(review => (
                    <Card key={review.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-lg">{review.strain_name}</h3>
                              <Badge className={getTypeColor(review.strain_type)}>{review.strain_type}</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              {[1, 2, 3, 4, 5].map(n => (
                                <Star key={n} className={`w-4 h-4 ${n <= review.rating ? "fill-hippie-yellow text-hippie-yellow" : "text-muted-foreground"}`} />
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <User className="w-4 h-4" />
                            {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                          </div>
                        </div>

                        <h4 className="font-semibold mb-2">{review.title}</h4>
                        <p className="text-muted-foreground mb-4">{review.review_text}</p>

                        {review.effects.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {review.effects.map(effect => (
                              <Badge key={effect} variant="outline" className="text-xs">{effect}</Badge>
                            ))}
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          {review.pros && review.pros.length > 0 && (
                            <div>
                              <span className="text-sm font-medium text-hippie-green">Pros:</span>
                              <ul className="text-sm text-muted-foreground">
                                {review.pros.map((pro, i) => <li key={i}>+ {pro}</li>)}
                              </ul>
                            </div>
                          )}
                          {review.cons && review.cons.length > 0 && (
                            <div>
                              <span className="text-sm font-medium text-hippie-orange">Cons:</span>
                              <ul className="text-sm text-muted-foreground">
                                {review.cons.map((con, i) => <li key={i}>- {con}</li>)}
                              </ul>
                            </div>
                          )}
                        </div>

                        <Button variant="ghost" size="sm" onClick={() => markHelpful(review.id)} className="text-muted-foreground">
                          <ThumbsUp className="w-4 h-4 mr-2" />
                          Helpful ({review.helpful_count})
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StrainReviews;
