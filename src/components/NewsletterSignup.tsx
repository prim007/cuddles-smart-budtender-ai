import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface NewsletterSignupProps {
  className?: string;
}

export function NewsletterSignup({ className = "" }: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // 1. Insert into newsletter_subscribers table
      // Generate a UUID to use for confirmation
      const id = crypto.randomUUID();
      
      const { error: insertError } = await supabase
        .from('newsletter_subscribers')
        .insert({
          id,
          email: email.toLowerCase(),
          name: name || null,
          status: 'pending'
        });

      if (insertError) {
        if (insertError.code === '23505') { // Unique violation
          toast.success("You're already on our list!");
          setEmail("");
          setName("");
          return;
        }
        throw insertError;
      }

      // 2. Trigger the transactional email with the confirmation link
      const origin = window.location.origin;
      const confirmationUrl = `${origin}/newsletter/confirm?token=${id}`;

      const { error: emailError } = await supabase.functions.invoke('send-transactional-email', {
        body: {
          templateName: 'newsletter-confirmation',
          recipientEmail: email,
          idempotencyKey: `newsletter-confirm-${id}`,
          templateData: { 
            name: name || 'Friend',
            confirmationUrl 
          },
        },
      });

      if (emailError) throw emailError;

      toast.success("Thanks for signing up! Please check your email to confirm your subscription.");
      setEmail("");
      setName("");
      
    } catch (error) {
      console.error("Newsletter signup error:", error);
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col gap-3 ${className}`}>
      <div className="space-y-2">
        <Input
          type="text"
          placeholder="First Name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isSubmitting}
          className="bg-background"
        />
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isSubmitting}
          required
          className="bg-background"
        />
      </div>
      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Subscribing...
          </>
        ) : (
          "Subscribe"
        )}
      </Button>
      <p className="text-xs text-muted-foreground text-center mt-2">
        We respect your privacy. Unsubscribe at any time.
      </p>
    </form>
  );
}