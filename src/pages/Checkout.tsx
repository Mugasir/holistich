import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, Phone, ShoppingBag } from "lucide-react";

const Checkout = () => {
  const { items, totalPrice, clearCart, setIsCartOpen } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ address: "", city: "", phone: "" });
  const [paymentMethod, setPaymentMethod] = useState<"mtn" | "airtel" | "card">("mtn");
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-12">
        <div className="text-center">
          <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h1 className="text-2xl font-heading font-bold mb-2">Please Sign In</h1>
          <p className="text-muted-foreground mb-4">You need to be signed in to checkout</p>
          <Button onClick={() => navigate("/login")}>Sign In</Button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-12">
        <div className="text-center">
          <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h1 className="text-2xl font-heading font-bold mb-2">Your Cart is Empty</h1>
          <Button onClick={() => navigate("/shop")}>Browse Products</Button>
        </div>
      </div>
    );
  }

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.address.trim() || !form.city.trim() || !form.phone.trim()) {
      toast({ title: "Please fill in all delivery details", variant: "destructive" });
      return;
    }
    setLoading(true);

    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total: totalPrice,
          delivery_address: form.address.trim(),
          delivery_city: form.city.trim(),
          delivery_phone: form.phone.trim(),
          payment_method: paymentMethod,
          status: "pending",
        })
        .select()
        .single();

      if (orderError || !order) {
        toast({ title: "Failed to create order", description: orderError?.message, variant: "destructive" });
        setLoading(false);
        return;
      }

      // Create order items
      const { data: products } = await supabase.from("products").select("id, size, price");
      
      const orderItems = items.map((item) => {
        const matchedProduct = products?.find((p) => p.size === item.size && p.price === item.price);
        return {
          order_id: order.id,
          product_id: matchedProduct?.id || item.id,
          quantity: item.quantity,
          price: item.price,
          size: item.size,
        };
      });

      await supabase.from("order_items").insert(orderItems);

      // Initiate Pesapal payment
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      const callbackUrl = `${window.location.origin}/dashboard?order=${order.id}`;
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;

      const pesapalRes = await fetch(
        `https://${projectId}.supabase.co/functions/v1/pesapal-payment/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ orderId: order.id, callbackUrl }),
        }
      );

      const pesapalData = await pesapalRes.json();

      if (!pesapalRes.ok || !pesapalData.redirect_url) {
        // Order created but payment init failed - redirect to dashboard
        toast({
          title: "Order created",
          description: "Payment could not be initiated. You can retry from your dashboard.",
          variant: "destructive",
        });
        clearCart();
        setIsCartOpen(false);
        navigate("/dashboard");
        return;
      }

      // Success - clear cart and redirect to Pesapal payment page
      clearCart();
      setIsCartOpen(false);
      toast({ title: "Redirecting to payment...", description: `Order: ${order.id.slice(0, 8).toUpperCase()}` });
      window.location.href = pesapalData.redirect_url;
    } catch (err) {
      console.error("Checkout error:", err);
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const paymentOptions = [
    { value: "mtn" as const, label: "MTN Mobile Money", icon: Phone, color: "bg-yellow-500" },
    { value: "airtel" as const, label: "Airtel Money", icon: Phone, color: "bg-red-500" },
    { value: "card" as const, label: "Card Payment", icon: CreditCard, color: "bg-blue-500" },
  ];

  return (
    <div className="py-12 md:py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-heading font-bold mb-8 text-center">Checkout</h1>
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleOrder} className="space-y-6">
              {/* Delivery */}
              <div className="bg-card rounded-2xl border border-border/50 p-6">
                <h2 className="text-lg font-heading font-semibold mb-4">Delivery Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Delivery Address</label>
                    <Input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} placeholder="Street, building, area" maxLength={300} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">City</label>
                    <Input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} placeholder="Kampala" maxLength={100} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Phone Number</label>
                    <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+256 7XX XXX XXX" maxLength={20} />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-card rounded-2xl border border-border/50 p-6">
                <h2 className="text-lg font-heading font-semibold mb-4">Payment Method</h2>
                <div className="space-y-3">
                  {paymentOptions.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        paymentMethod === opt.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={opt.value}
                        checked={paymentMethod === opt.value}
                        onChange={() => setPaymentMethod(opt.value)}
                        className="sr-only"
                      />
                      <div className={`w-10 h-10 rounded-full ${opt.color} flex items-center justify-center`}>
                        <opt.icon className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-medium">{opt.label}</span>
                      {paymentMethod === opt.value && (
                        <div className="ml-auto w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                        </div>
                      )}
                    </label>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  {paymentMethod === "mtn" && "A payment prompt will be sent to your MTN Mobile Money number."}
                  {paymentMethod === "airtel" && "A payment prompt will be sent to your Airtel Money number."}
                  {paymentMethod === "card" && "You'll be redirected to a secure payment page."}
                </p>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Placing order..." : `Place Order · UGX ${totalPrice.toLocaleString()}`}
              </Button>
            </form>
          </div>

          {/* Summary */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-2xl border border-border/50 p-6 sticky top-24">
              <h2 className="text-lg font-heading font-semibold mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.name} ({item.size}) × {item.quantity}</span>
                    <span className="font-medium">UGX {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-3 flex justify-between font-heading font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">UGX {totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
