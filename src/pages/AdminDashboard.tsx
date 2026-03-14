import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, DollarSign, Users, ShoppingCart, Mail, Plus, Pencil, Trash2, Eye } from "lucide-react";

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

interface Product {
  id: string;
  name: string;
  size: string;
  price: number;
  description: string;
  is_active: boolean;
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
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tab, setTab] = useState<"overview" | "orders" | "products" | "messages">("overview");
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [messages, setMessages] = useState<ContactMsg[]>([]);
  const [dateFilter, setDateFilter] = useState("");

  // Product form
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({ name: "Pure Cold Pressed Castor Oil", size: "", price: "", description: "" });

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

  const updateOrderStatus = async (orderId: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
    if (error) {
      toast({ title: "Failed to update", variant: "destructive" });
    } else {
      toast({ title: `Order updated to ${status}` });
      fetchOrders();
    }
  };

  const saveProduct = async () => {
    const price = parseInt(productForm.price);
    if (!productForm.size || !price) {
      toast({ title: "Fill in size and price", variant: "destructive" });
      return;
    }
    if (editingProduct) {
      await supabase.from("products").update({
        name: productForm.name, size: productForm.size, price, description: productForm.description,
      }).eq("id", editingProduct.id);
    } else {
      await supabase.from("products").insert({
        name: productForm.name, size: productForm.size, price, description: productForm.description,
      });
    }
    setEditingProduct(null);
    setProductForm({ name: "Pure Cold Pressed Castor Oil", size: "", price: "", description: "" });
    fetchProducts();
    toast({ title: editingProduct ? "Product updated" : "Product added" });
  };

  const deleteProduct = async (id: string) => {
    await supabase.from("products").update({ is_active: false }).eq("id", id);
    fetchProducts();
    toast({ title: "Product deactivated" });
  };

  const markRead = async (id: string) => {
    await supabase.from("contact_messages").update({ is_read: true }).eq("id", id);
    fetchMessages();
  };

  if (authLoading) return <div className="min-h-[60vh] flex items-center justify-center"><p>Loading...</p></div>;
  if (!isAdmin) return null;

  const totalSales = orders.filter((o) => o.status !== "pending").reduce((s, o) => s + o.total, 0);
  const orderCount = orders.length;
  const unreadMessages = messages.filter((m) => !m.is_read).length;

  const tabs = [
    { key: "overview" as const, label: "Overview", icon: DollarSign },
    { key: "orders" as const, label: "Orders", icon: ShoppingCart },
    { key: "products" as const, label: "Products", icon: Package },
    { key: "messages" as const, label: `Messages${unreadMessages ? ` (${unreadMessages})` : ""}`, icon: Mail },
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

        {/* Overview */}
        {tab === "overview" && (
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="bg-card rounded-xl border border-border/50 p-6">
              <DollarSign className="h-8 w-8 text-primary mb-2" />
              <p className="text-sm text-muted-foreground">Total Sales</p>
              <p className="text-2xl font-heading font-bold">UGX {totalSales.toLocaleString()}</p>
            </div>
            <div className="bg-card rounded-xl border border-border/50 p-6">
              <ShoppingCart className="h-8 w-8 text-primary mb-2" />
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-2xl font-heading font-bold">{orderCount}</p>
            </div>
            <div className="bg-card rounded-xl border border-border/50 p-6">
              <Users className="h-8 w-8 text-primary mb-2" />
              <p className="text-sm text-muted-foreground">Unread Messages</p>
              <p className="text-2xl font-heading font-bold">{unreadMessages}</p>
            </div>
          </div>
        )}

        {/* Orders */}
        {tab === "orders" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="w-auto" />
              {dateFilter && <Button variant="ghost" size="sm" onClick={() => setDateFilter("")}>Clear</Button>}
            </div>
            {orders.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No orders found</p>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="bg-card rounded-xl border border-border/50 p-5 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs text-muted-foreground">#{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="font-heading font-semibold">UGX {order.total.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleString()} · {order.payment_method?.toUpperCase()} · {order.delivery_city}
                      </p>
                      <p className="text-xs text-muted-foreground">{order.delivery_address} · {order.delivery_phone}</p>
                    </div>
                    <Select value={order.status} onValueChange={(val) => updateOrderStatus(order.id, val)}>
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["pending", "paid", "processing", "shipped", "delivered"].map((s) => (
                          <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Products */}
        {tab === "products" && (
          <div className="space-y-6">
            <div className="bg-card rounded-xl border border-border/50 p-6">
              <h2 className="font-heading font-semibold mb-4">{editingProduct ? "Edit Product" : "Add Product"}</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input placeholder="Product name" value={productForm.name} onChange={(e) => setProductForm((f) => ({ ...f, name: e.target.value }))} />
                <Input placeholder="Size (e.g. 100ml)" value={productForm.size} onChange={(e) => setProductForm((f) => ({ ...f, size: e.target.value }))} />
                <Input type="number" placeholder="Price in UGX" value={productForm.price} onChange={(e) => setProductForm((f) => ({ ...f, price: e.target.value }))} />
                <Input placeholder="Description" value={productForm.description} onChange={(e) => setProductForm((f) => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={saveProduct}><Plus className="h-4 w-4 mr-2" /> {editingProduct ? "Update" : "Add"}</Button>
                {editingProduct && <Button variant="ghost" onClick={() => { setEditingProduct(null); setProductForm({ name: "Pure Cold Pressed Castor Oil", size: "", price: "", description: "" }); }}>Cancel</Button>}
              </div>
            </div>
            <div className="space-y-3">
              {products.map((p) => (
                <div key={p.id} className={`bg-card rounded-xl border border-border/50 p-4 flex items-center justify-between ${!p.is_active ? "opacity-50" : ""}`}>
                  <div>
                    <p className="font-medium">{p.name} — {p.size}</p>
                    <p className="text-sm text-primary font-semibold">UGX {p.price.toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => { setEditingProduct(p); setProductForm({ name: p.name, size: p.size, price: String(p.price), description: p.description }); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {p.is_active && (
                      <Button variant="ghost" size="icon" onClick={() => deleteProduct(p.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {tab === "messages" && (
          <div className="space-y-3">
            {messages.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No messages</p>
            ) : (
              messages.map((m) => (
                <div key={m.id} className={`bg-card rounded-xl border border-border/50 p-5 ${!m.is_read ? "border-l-4 border-l-primary" : ""}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{m.name} <span className="text-sm text-muted-foreground">({m.email})</span></p>
                      <p className="text-sm text-muted-foreground mt-1">{m.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">{new Date(m.created_at).toLocaleString()}</p>
                    </div>
                    {!m.is_read && (
                      <Button variant="ghost" size="sm" onClick={() => markRead(m.id)}>
                        <Eye className="h-4 w-4 mr-1" /> Mark read
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
