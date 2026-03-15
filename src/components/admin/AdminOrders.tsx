import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

interface AdminOrdersProps {
  orders: Order[];
  dateFilter: string;
  setDateFilter: (v: string) => void;
  updateOrderStatus: (orderId: string, status: string) => void;
}

const AdminOrders = ({ orders, dateFilter, setDateFilter, updateOrderStatus }: AdminOrdersProps) => (
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
);

export default AdminOrders;
