import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserPlus } from "lucide-react";
import type { Session } from "@supabase/supabase-js";

interface AdminUsersProps {
  session: Session | null;
}

interface AdminUser {
  user_id: string;
  full_name: string;
}

const AdminUsers = ({ session }: AdminUsersProps) => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [admins, setAdmins] = useState<AdminUser[]>([]);

  const fetchAdmins = async () => {
    const { data: roles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    if (!roles?.length) { setAdmins([]); return; }

    const ids = roles.map((r) => r.user_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", ids);

    setAdmins(
      ids.map((uid) => ({
        user_id: uid,
        full_name: profiles?.find((p) => p.id === uid)?.full_name || "—",
      }))
    );
  };

  useEffect(() => { fetchAdmins(); }, []);

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
      fetchAdmins();
    } catch (err: any) {
      toast({ title: "Failed to create admin", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Existing admins list */}
      <div className="bg-card rounded-xl border border-border/50 p-6">
        <h2 className="font-heading font-semibold text-lg mb-4">Current Admin Users ({admins.length})</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>User ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {admins.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-6">No admin users found</TableCell>
              </TableRow>
            ) : (
              admins.map((a, i) => (
                <TableRow key={a.user_id}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell className="font-medium">{a.full_name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">{a.user_id.slice(0, 8)}…</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add admin form */}
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
    </div>
  );
};

export default AdminUsers;
