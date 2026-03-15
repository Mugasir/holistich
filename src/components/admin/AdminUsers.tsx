import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus } from "lucide-react";
import type { Session } from "@supabase/supabase-js";

interface AdminUsersProps {
  session: Session | null;
}

const AdminUsers = ({ session }: AdminUsersProps) => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddAdmin = async () => {
    if (!email || !password) {
      toast({ title: "Email and password are required", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await supabase.functions.invoke("create-admin", {
        body: { email, password, full_name: fullName },
      });

      if (res.error) throw res.error;
      if (res.data?.error) throw new Error(res.data.error);

      toast({ title: "Admin user created successfully!" });
      setEmail("");
      setPassword("");
      setFullName("");
    } catch (err: any) {
      toast({ title: "Failed to create admin", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg">
      <div className="bg-card rounded-xl border border-border/50 p-6 space-y-4">
        <h2 className="font-heading font-semibold text-lg">Add Admin User</h2>
        <p className="text-sm text-muted-foreground">Create a new admin account or promote an existing user to admin.</p>
        <Input placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <Input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button onClick={handleAddAdmin} disabled={loading}>
          <UserPlus className="h-4 w-4 mr-2" /> {loading ? "Creating..." : "Create Admin"}
        </Button>
      </div>
    </div>
  );
};

export default AdminUsers;
