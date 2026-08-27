import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Trash2, Leaf, ArrowLeft, Package, Edit2, Save, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SEO from "@/components/SEO";

const CATEGORIES = [
  "Help me sleep", "Boost creativity", "Pain relief",
  "Social energy", "Stress relief", "Morning energy", "Custom"
];

const STRAIN_TYPES = ["Indica", "Sativa", "Hybrid", "Hybrid (High CBD)", "Indica (High CBD)"];

interface TenantStrain {
  id: string;
  category: string;
  strain_name: string;
  strain_type: string;
  primary_terpene: string | null;
  secondary_terpene: string | null;
  primary_effect: string | null;
  notes: string | null;
  thc_min: number | null;
  thc_max: number | null;
  price: number | null;
  in_stock: boolean;
}

const ManageStrains = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [strains, setStrains] = useState<TenantStrain[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  // New strain form
  const [newStrain, setNewStrain] = useState({
    category: CATEGORIES[0],
    strain_name: "",
    strain_type: STRAIN_TYPES[0],
    primary_terpene: "",
    secondary_terpene: "",
    primary_effect: "",
    notes: "",
    thc_min: "",
    thc_max: "",
    price: "",
    in_stock: true,
  });

  useEffect(() => {
    if (!user) return;
    fetchTenant();
  }, [user]);

  const fetchTenant = async () => {
    const { data } = await supabase
      .from("tenants")
      .select("id")
      .eq("user_id", user!.id)
      .single();

    if (data) {
      setTenantId(data.id);
      fetchStrains(data.id);
    } else {
      setLoading(false);
      toast.error("No dispensary account found. Please onboard first.");
    }
  };

  const fetchStrains = async (tid: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("tenant_strains")
      .select("*")
      .eq("tenant_id", tid)
      .order("category", { ascending: true });

    if (error) toast.error(error.message);
    else setStrains((data as TenantStrain[]) || []);
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!tenantId || !newStrain.strain_name.trim()) {
      toast.error("Strain name is required");
      return;
    }

    const { error } = await supabase.from("tenant_strains").insert({
      tenant_id: tenantId,
      category: newStrain.category,
      strain_name: newStrain.strain_name.trim(),
      strain_type: newStrain.strain_type,
      primary_terpene: newStrain.primary_terpene || null,
      secondary_terpene: newStrain.secondary_terpene || null,
      primary_effect: newStrain.primary_effect || null,
      notes: newStrain.notes || null,
      thc_min: newStrain.thc_min ? Number(newStrain.thc_min) : null,
      thc_max: newStrain.thc_max ? Number(newStrain.thc_max) : null,
      price: newStrain.price ? Number(newStrain.price) : null,
      in_stock: newStrain.in_stock,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Strain added!");
      setShowAdd(false);
      setNewStrain({ category: CATEGORIES[0], strain_name: "", strain_type: STRAIN_TYPES[0], primary_terpene: "", secondary_terpene: "", primary_effect: "", notes: "", thc_min: "", thc_max: "", price: "", in_stock: true });
      fetchStrains(tenantId);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("tenant_strains").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Strain removed");
      setStrains(strains.filter(s => s.id !== id));
    }
  };

  const toggleStock = async (id: string, inStock: boolean) => {
    const { error } = await supabase
      .from("tenant_strains")
      .update({ in_stock: !inStock })
      .eq("id", id);
    if (error) toast.error(error.message);
    else {
      setStrains(strains.map(s => s.id === id ? { ...s, in_stock: !inStock } : s));
      toast.success(inStock ? "Marked out of stock" : "Marked in stock");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center space-y-4">
            <Leaf className="w-12 h-12 mx-auto text-primary" />
            <h2 className="text-xl font-bold">Sign in required</h2>
            <p className="text-muted-foreground">You need to be signed in to manage your strain catalog.</p>
            <Button onClick={() => navigate("/auth?redirect=/manage-strains")}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const grouped = strains.reduce<Record<string, TenantStrain[]>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <SEO
        title="Manage Your Dispensary Strains | Cuddles AI"
        description="Add, edit, and sync the strains in your dispensary menu so Cuddles AI recommends what you actually stock."
        url="/manage-strains"
        noindex
      />
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Package className="w-6 h-6 text-primary" /> Strain Catalog
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage your dispensary's strain menu. These strains are used by your embedded Cuddles widget.
              </p>
            </div>
          </div>
          <Button onClick={() => setShowAdd(!showAdd)} className="gap-2">
            <Plus className="w-4 h-4" /> Add Strain
          </Button>
        </div>

        {/* Add Form */}
        {showAdd && (
          <Card className="border-primary/30 animate-fade-in">
            <CardHeader>
              <CardTitle className="text-lg">Add New Strain</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <select
                    value={newStrain.category}
                    onChange={e => setNewStrain({ ...newStrain, category: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Strain Name *</Label>
                  <Input
                    value={newStrain.strain_name}
                    onChange={e => setNewStrain({ ...newStrain, strain_name: e.target.value })}
                    placeholder="Blue Dream"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <select
                    value={newStrain.strain_type}
                    onChange={e => setNewStrain({ ...newStrain, strain_type: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {STRAIN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Primary Terpene</Label>
                  <Input
                    value={newStrain.primary_terpene}
                    onChange={e => setNewStrain({ ...newStrain, primary_terpene: e.target.value })}
                    placeholder="Myrcene"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Secondary Terpene</Label>
                  <Input
                    value={newStrain.secondary_terpene}
                    onChange={e => setNewStrain({ ...newStrain, secondary_terpene: e.target.value })}
                    placeholder="Limonene"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Primary Effect</Label>
                  <Input
                    value={newStrain.primary_effect}
                    onChange={e => setNewStrain({ ...newStrain, primary_effect: e.target.value })}
                    placeholder="Relaxing"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Price ($)</Label>
                  <Input
                    type="number"
                    value={newStrain.price}
                    onChange={e => setNewStrain({ ...newStrain, price: e.target.value })}
                    placeholder="35"
                  />
                </div>
                <div className="space-y-2">
                  <Label>THC Range (%)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={newStrain.thc_min}
                      onChange={e => setNewStrain({ ...newStrain, thc_min: e.target.value })}
                      placeholder="Min"
                    />
                    <Input
                      type="number"
                      value={newStrain.thc_max}
                      onChange={e => setNewStrain({ ...newStrain, thc_max: e.target.value })}
                      placeholder="Max"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Input
                  value={newStrain.notes}
                  onChange={e => setNewStrain({ ...newStrain, notes: e.target.value })}
                  placeholder="Great for evening use, sweet berry flavor..."
                />
              </div>
              <div className="flex gap-3">
                <Button onClick={handleAdd} className="gap-2">
                  <Save className="w-4 h-4" /> Save Strain
                </Button>
                <Button variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Strain List */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading your catalog...</div>
        ) : strains.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center space-y-4">
              <Leaf className="w-12 h-12 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-medium text-foreground">No strains yet</h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                Add your dispensary's strains so Cuddles can recommend them to your customers. Click "Add Strain" to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(grouped).map(([category, categoryStrains]) => (
            <Card key={category}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-primary" />
                  {category}
                  <span className="text-xs text-muted-foreground font-normal">({categoryStrains.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {categoryStrains.map(strain => (
                  <div
                    key={strain.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      strain.in_stock
                        ? "bg-muted/30 border-border/50"
                        : "bg-muted/10 border-border/20 opacity-60"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-foreground">{strain.strain_name}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {strain.strain_type}
                        </span>
                        {!strain.in_stock && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                            Out of stock
                          </span>
                        )}
                        {strain.price && (
                          <span className="text-xs text-muted-foreground">${strain.price}</span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {[strain.primary_terpene, strain.secondary_terpene].filter(Boolean).join(" / ")}
                        {strain.primary_effect && ` • ${strain.primary_effect}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleStock(strain.id, strain.in_stock)}
                        className="text-xs"
                      >
                        {strain.in_stock ? "Mark OOS" : "Restock"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(strain.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ManageStrains;
