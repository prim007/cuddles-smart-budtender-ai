import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, MailX, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function Unsubscribe() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState<"loading" | "valid" | "invalid" | "unsubscribed" | "error">("loading");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function validateToken() {
      if (!token) {
        setStatus("invalid");
        return;
      }

      try {
        // Validation GET call (requires manual fetch due to GET method)
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${token}`,
          {
            headers: {
              apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            },
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            setStatus("invalid");
            return;
          }
          throw new Error("Validation failed");
        }

        const data = await response.json();
        
        if (data.valid === false && data.reason === "already_unsubscribed") {
          setStatus("unsubscribed");
        } else if (data.valid) {
          setStatus("valid");
        } else {
          setStatus("invalid");
        }
      } catch (error) {
        console.error("Token validation error:", error);
        setStatus("error");
      }
    }

    validateToken();
  }, [token]);

  const handleUnsubscribe = async () => {
    if (!token) return;
    
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("handle-email-unsubscribe", {
        body: { token },
      });

      if (error) throw error;
      
      if (data?.success || (data?.success === false && data?.reason === "already_unsubscribed")) {
        setStatus("unsubscribed");
        toast.success("You have been successfully unsubscribed.");
      } else {
        throw new Error("Failed to unsubscribe");
      }
    } catch (error) {
      console.error("Unsubscribe error:", error);
      toast.error("Failed to process your request. Please try again later.");
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full border-primary/20 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
            {status === "loading" && <Loader2 className="w-6 h-6 animate-spin" />}
            {status === "valid" && <MailX className="w-6 h-6" />}
            {status === "unsubscribed" && <CheckCircle2 className="w-6 h-6 text-green-500" />}
            {(status === "invalid" || status === "error") && <AlertCircle className="w-6 h-6 text-destructive" />}
          </div>
          <CardTitle className="text-2xl font-space-grotesk text-primary">
            {status === "loading" && "Loading..."}
            {status === "valid" && "Unsubscribe"}
            {status === "unsubscribed" && "Unsubscribed"}
            {status === "invalid" && "Invalid Link"}
            {status === "error" && "Error"}
          </CardTitle>
          <CardDescription className="text-base mt-2">
            {status === "loading" && "Verifying your link..."}
            {status === "valid" && "Are you sure you want to stop receiving these emails?"}
            {status === "unsubscribed" && "You have been successfully removed from this mailing list."}
            {status === "invalid" && "This unsubscribe link is invalid or has expired."}
            {status === "error" && "We encountered an error processing your request."}
          </CardDescription>
        </CardHeader>
        
        {status === "valid" && (
          <CardFooter className="flex flex-col gap-3">
            <Button 
              onClick={handleUnsubscribe} 
              disabled={isSubmitting}
              className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm Unsubscribe"
              )}
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.location.href = "/"}
            >
              Cancel
            </Button>
          </CardFooter>
        )}

        {(status === "unsubscribed" || status === "invalid" || status === "error") && (
          <CardFooter>
            <Button 
              className="w-full"
              onClick={() => window.location.href = "/"}
            >
              Return to Homepage
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}