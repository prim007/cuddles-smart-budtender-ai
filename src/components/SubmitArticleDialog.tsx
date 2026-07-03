import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Send, PenLine } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const articleSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  title: z.string().trim().min(1, "Title is required").max(200),
  summary: z.string().trim().min(10, "Please provide at least a brief summary").max(2000),
});

const SubmitArticleDialog = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", title: "", summary: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = articleSchema.safeParse(form);
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("article_submissions").insert({
        author_name: result.data.name,
        author_email: result.data.email,
        title: result.data.title,
        summary: result.data.summary,
      });

      if (error) throw error;

      toast.success("Article submitted! We'll review it and get back to you.");
      setForm({ name: "", email: "", title: "", summary: "" });
      setOpen(false);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-hippie-purple to-hippie-pink text-white hover:opacity-90 gap-2">
          <PenLine className="w-4 h-4" />
          Submit Your Article
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Submit an Article</DialogTitle>
          <DialogDescription>
            Share your cannabis knowledge with the Cuddles community. We'll review your submission and publish it on our blog.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              placeholder="Jane Doe"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              maxLength={100}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              maxLength={255}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="article-title">Article Title</Label>
            <Input
              id="article-title"
              placeholder="e.g. Understanding Terpene Profiles"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              maxLength={200}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="summary">Article Summary / Content</Label>
            <Textarea
              id="summary"
              placeholder="Write your article or a summary of what you'd like to cover..."
              value={form.summary}
              onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
              maxLength={2000}
              rows={5}
              required
            />
          </div>
          <Button type="submit" className="w-full gap-2" disabled={loading}>
            <Send className="w-4 h-4" />
            {loading ? "Submitting..." : "Submit Article"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SubmitArticleDialog;
