import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminOverview from "@/components/admin/AdminOverview";
import AdminOrders from "@/components/admin/AdminOrders";
import AdminProducts from "@/components/admin/AdminProducts";
import AdminMessages from "@/components/admin/AdminMessages";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminClients from "@/components/admin/AdminClients";
import { DollarSign, ShoppingCart, Package, Mail, UserPlus, Users } from "lucide-react";

interface Order {
  id: string;
  user_id: string;
  status: string;
  total: number;
  delivery_address: string;
  delivery_city: string;
  delivery_phone: string;
  payment_method: string;
  payment_reference: string;
  created_at: string;
}

interface ContactMsg {
  id: string;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const AdminDashboard = () => {
  const { user, isAdmin, loading: authLoading, session } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tab, setTab] = useState<"overview" | "orders" | "products" | "messages" | "users" | "clients">("overview");
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [messages, setMessages] = useState<ContactMsg[]>([]);
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) navigate("/");
  }, [user, isAdmin, authLoading]);

  const fetchOrders = async () => {
    let query = supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (dateFilter) {
      query = query.gte("created_at", `${dateFilter}T00:00:00`).lte("created_at", `${dateFilter}T23:59:59`);
    }
    const { data } = await query;
    setOrders(data || []);
  };

  const fetchProducts = async () => {
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: true });
    setProducts(data || []);
  };

  const fetchMessages = async () => {
    const { data } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
    setMessages(data || []);
  };

  useEffect(() => {
    if (isAdmin) {
      fetchOrders();
      fetchProducts();
      fetchMessages();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) fetchOrders();
  }, [dateFilter]);

  // Realtime orders subscription
  useEffect(() => {
    if (!isAdmin) return;

    const channel = supabase
      .channel("admin-orders-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setOrders((prev) => [payload.new as Order, ...prev]);
            toast({ title: "🔔 New order received!", description: `Order #${(payload.new as Order).id.slice(0, 8).toUpperCase()}` });
          } else if (payload.eventType === "UPDATE") {
            setOrders((prev) => prev.map((o) => (o.id === (payload.new as Order).id ? (payload.new as Order) : o)));
          } else if (payload.eventType === "DELETE") {
            setOrders((prev) => prev.filter((o) => o.id !== (payload.old as any).id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  const updateOrderStatus = async (orderId: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
    if (error) {
      toast({ title: "Failed to update", variant: "destructive" });
    } else {
      toast({ title: `Order updated to ${status}` });
    }
  };

  if (authLoading) return <div className="min-h-[60vh] flex items-center justify-center"><p>Loading...</p></div>;
  if (!isAdmin) return null;

  const totalSales = orders.filter((o) => o.status !== "pending").reduce((s, o) => s + o.total, 0);
  const unreadMessages = messages.filter((m) => !m.is_read).length;

  const tabs = [
    { key: "overview" as const, label: "Overview", icon: DollarSign },
    { key: "orders" as const, label: "Orders", icon: ShoppingCart },
    { key: "products" as const, label: "Products", icon: Package },
    { key: "messages" as const, label: `Messages${unreadMessages ? ` (${unreadMessages})` : ""}`, icon: Mail },
    { key: "users" as const, label: "Admin Users", icon: UserPlus },
    { key: "clients" as const, label: "Clients", icon: Users },
  ];

  return (
    <div className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-heading font-bold mb-8">Admin Dashboard</h1>

        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((t) => (
            <Button key={t.key} variant={tab === t.key ? "default" : "outline"} size="sm" onClick={() => setTab(t.key)}>
              <t.icon className="h-4 w-4 mr-2" /> {t.label}
            </Button>
          ))}
        </div>

        {tab === "overview" && (
          <AdminOverview totalSales={totalSales} orderCount={orders.length} unreadMessages={unreadMessages} />
        )}
        {tab === "orders" && (
          <AdminOrders orders={orders} dateFilter={dateFilter} setDateFilter={setDateFilter} updateOrderStatus={updateOrderStatus} />
        )}
        {tab === "products" && (
          <AdminProducts products={products} fetchProducts={fetchProducts} />
        )}
        {tab === "messages" && (
          <AdminMessages messages={messages} fetchMessages={fetchMessages} />
        )}
        {tab === "users" && (
          <AdminUsers session={session} />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
