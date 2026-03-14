import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, User, LogOut, Clock, CheckCircle, Truck, MapPin } from "lucide-react";

interface Order {
  id: string;
  status: string;
  total: number;
  delivery_city: string;
  payment_method: string;
  created_at: string;
}

const statusConfig: Record<string, { icon: typeof Clock; color: string; label: string }> = {
  pending: { icon: Clock, color: "text-yellow-600 bg-yellow-100", label: "Pending" },
  paid: { icon: CheckCircle, color: "text-blue-600 bg-blue-100", label: "Paid" },
  processing: { icon: Package, color: "text-orange-600 bg-orange-100", label: "Processing" },
  shipped: { icon: Truck, color: "text-purple-600 bg-purple-100", label: "Shipped" },
  delivered: { icon: MapPin, color: "text-green-600 bg-green-100", label: "Delivered" },
};

const Dashboard = () => {
  const { user, profile, signOut, refreshProfile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState<"orders" | "profile">("orders");
  const [profileForm, setProfileForm] = useState({ full_name: "", phone: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [user, authLoading]);

  useEffect(() => {
    if (profile) setProfileForm({ full_name: profile.full_name, phone: profile.phone });
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("orders")
      .select("id, status, total, delivery_city, payment_method, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setOrders(data || []));
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: profileForm.full_name.trim(), phone: profileForm.phone.trim() })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast({ title: "Failed to update profile", variant: "destructive" });
    } else {
      toast({ title: "Profile updated!" });
      refreshProfile();
    }
  };

  if (authLoading) return <div className="min-h-[60vh] flex items-center justify-center"><p>Loading...</p></div>;
  if (!user) return null;

  return (
    <div className="py-12 md:py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold">My Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">Welcome, {profile?.full_name || user.email}</p>
          </div>
          <Button variant="outline" size="sm" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button variant={tab === "orders" ? "default" : "outline"} size="sm" onClick={() => setTab("orders")}>
            <Package className="h-4 w-4 mr-2" /> Orders
          </Button>
          <Button variant={tab === "profile" ? "default" : "outline"} size="sm" onClick={() => setTab("profile")}>
            <User className="h-4 w-4 mr-2" /> Profile
          </Button>
        </div>

        {tab === "orders" && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="bg-card rounded-2xl border border-border/50 p-8 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No orders yet</p>
                <Button className="mt-4" onClick={() => navigate("/shop")}>Start Shopping</Button>
              </div>
            ) : (
              orders.map((order) => {
                const sc = statusConfig[order.status] || statusConfig.pending;
                const Icon = sc.icon;
                return (
                  <div key={order.id} className="bg-card rounded-xl border border-border/50 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-xs text-muted-foreground">#{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="font-heading font-semibold mt-1">UGX {order.total.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(order.created_at).toLocaleDateString()} · {order.delivery_city} · {order.payment_method?.toUpperCase()}
                      </p>
                    </div>
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${sc.color}`}>
                      <Icon className="h-3.5 w-3.5" />
                      {sc.label}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {tab === "profile" && (
          <div className="bg-card rounded-2xl border border-border/50 p-6 max-w-lg">
            <h2 className="text-lg font-heading font-semibold mb-4">Profile Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Email</label>
                <Input value={user.email || ""} disabled />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Full Name</label>
                <Input value={profileForm.full_name} onChange={(e) => setProfileForm((f) => ({ ...f, full_name: e.target.value }))} maxLength={100} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Phone</label>
                <Input value={profileForm.phone} onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))} maxLength={20} />
              </div>
              <Button onClick={saveProfile} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
