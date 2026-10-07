import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const UUID = /^[0-9a-f-]{36}$/i;

const Invite = () => {
  const { userId = "" } = useParams();
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [msg, setMsg] = useState("Connecting you…");

  useEffect(() => {
    if (isLoading) return;
    if (!UUID.test(userId)) { setMsg("This invite link isn't valid."); return; }
    if (!user) { navigate(`/auth?next=${encodeURIComponent(`/invite/${userId}`)}`, { replace: true }); return; }
    if (user.id === userId) { navigate("/dashboard", { replace: true }); return; }
    (async () => {
      const { error } = await supabase.from("connections").insert({ requester_id: user.id, addressee_id: userId });
      setMsg(error ? "You're already connected or an invite is waiting." : "Friend request sent! They'll see it on their dashboard.");
    })();
  }, [user, isLoading, userId, navigate]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center space-y-4 max-w-sm">
        <p className="text-lg">{msg}</p>
        <Button onClick={() => navigate("/dashboard")}>Go to my dashboard</Button>
      </div>
    </main>
  );
};

export default Invite;
