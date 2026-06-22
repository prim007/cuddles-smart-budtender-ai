import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Sparkles } from "lucide-react";

/**
 * Shown once when a signed-in user has no `name` in their auth metadata.
 * Saves the name to user_metadata so Cuddles can greet them by name everywhere.
 */
const UserNamePrompt = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
    const hasName =
      (typeof meta.name === "string" && meta.name.trim()) ||
      (typeof meta.full_name === "string" && (meta.full_name as string).trim()) ||
      (typeof meta.given_name === "string" && (meta.given_name as string).trim());
    if (hasName) return;
    const dismissedFor = localStorage.getItem("cuddles_name_prompt_dismissed");
    if (dismissedFor === user.id) return;
    setOpen(true);
  }, [user]);

  const handleSave = async () => {
    const trimmed = name.trim().slice(0, 50);
    if (!trimmed) return;
    setSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: { name: trimmed, full_name: trimmed },
    });
    setSaving(false);
    if (error) {
      toast({ title: "Couldn't save your name", description: error.message, variant: "destructive" });
      return;
    }
    const firstName = trimmed.split(" ")[0];
    toast({ title: `Nice to meet you, ${firstName}! 🌿`, description: "Cuddles will greet you by name from now on." });
    if (user) localStorage.setItem("cuddles_name_prompt_dismissed", user.id);
    setOpen(false);
  };

  const handleSkip = () => {
    if (user) localStorage.setItem("cuddles_name_prompt_dismissed", user.id);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleSkip(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> What should Cuddles call you?
          </DialogTitle>
          <DialogDescription>
            Add your name so Cuddles can greet you personally in chat and around the app.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label htmlFor="cuddles-name">Your name</Label>
          <Input
            id="cuddles-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sam"
            maxLength={50}
            autoFocus
            onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
          />
        </div>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="ghost" onClick={handleSkip} disabled={saving}>Not now</Button>
          <Button onClick={handleSave} disabled={saving || !name.trim()}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserNamePrompt;
