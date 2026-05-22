import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function ConfirmNewsletter() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  
  const [status, setStatus] = useState<"loading" | "success" | "already_confirmed" | "error">("loading");

  useEffect(() => {
    async function confirmSubscription() {
      if (!token) {
        setStatus("error");
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke("confirm-newsletter-subscription", {
          body: { token }
        });

        if (error) throw error;
        
        if (data.already_confirmed) {
          setStatus("already_confirmed");
        } else if (data.success) {
          setStatus("success");
          toast.success("Thank you! Your subscription is confirmed.");
        } else {
          throw new Error("Failed to confirm");
        }
      } catch (error) {
        console.error("Confirmation error:", error);
        setStatus("error");
      }
    }

    confirmSubscription();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full border-primary/20 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-primary/10 text-primary">
            {status === "loading" && <Loader2 className="w-6 h-6 animate-spin" />}
            {(status === "success" || status === "already_confirmed") && <CheckCircle2 className="w-6 h-6 text-green-500" />}
            {status === "error" && <AlertCircle className="w-6 h-6 text-destructive" />}
          </div>
          <CardTitle className="text-2xl font-space-grotesk text-primary">
            {status === "loading" && "Confirming..."}
            {status === "success" && "Subscription Confirmed!"}
            {status === "already_confirmed" && "Already Confirmed"}
            {status === "error" && "Confirmation Failed"}
          </CardTitle>
          <CardDescription className="text-base mt-2">
            {status === "loading" && "Please wait while we confirm your subscription."}
            {status === "success" && "Thank you for subscribing to our newsletter. We're excited to share our updates with you!"}
            {status === "already_confirmed" && "You have already confirmed your subscription to our newsletter."}
            {status === "error" && "This confirmation link is invalid or has expired. Please try signing up again."}
          </CardDescription>
        </CardHeader>
        
        <CardFooter>
          <Button 
            className="w-full"
            onClick={() => navigate("/")}
          >
            Return to Homepage
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}