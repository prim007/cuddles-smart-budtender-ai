import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, AlertCircle, MailX } from "lucide-react";
import SEO from "@/components/SEO";

export default function Unsubscribe() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [pending, setPending] = useState(false);

  async function handleUnsubscribe(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const { data, error } = await supabase.functions.invoke("handle-email-unsubscribe", {
        body: { email, token: searchParams.get("token") ?? undefined },
      });
      if (error || !data?.success) throw error ?? new Error("Unsubscribe failed");
      setPending(Boolean(data.pending));
      setStatus("success");
    } catch (err) {
      console.error("Unsubscribe error:", err);
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <SEO
        title="Unsubscribe from Cuddles AI Emails"
        description="Opt out of Cuddles AI emails at any time."
        url="/unsubscribe"
        noindex
      />
      <Card className="max-w-md w-full border-primary/20 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-primary/10 text-primary">
            {status === "loading" && <Loader2 className="w-6 h-6 animate-spin" />}
            {status === "success" && <CheckCircle2 className="w-6 h-6" />}
            {status === "error" && <AlertCircle className="w-6 h-6 text-destructive" />}
            {status === "idle" && <MailX className="w-6 h-6" />}
          </div>
          <CardTitle className="text-2xl font-space-grotesk text-primary">
            {status === "success" ? "You're unsubscribed" : "Unsubscribe"}
          </CardTitle>
          <CardDescription className="text-base mt-2">
            {status === "success"
              ? "We've removed your address from our mailing list. You won't receive further emails from us."
              : "Confirm your email address below to stop receiving emails from Cuddles AI."}
          </CardDescription>
        </CardHeader>

        {status !== "success" && (
          <CardContent>
            <form onSubmit={handleUnsubscribe} className="space-y-3">
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                aria-label="Email address"
              />
              {status === "error" && (
                <p className="text-sm text-destructive">
                  Something went wrong. Please try again in a moment.
                </p>
              )}
              <Button type="submit" className="w-full" disabled={status === "loading"}>
                {status === "loading" ? "Unsubscribing..." : "Unsubscribe"}
              </Button>
            </form>
          </CardContent>
        )}

        <CardFooter>
          <Button variant="outline" className="w-full" onClick={() => navigate("/")}>
            Return to Homepage
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
