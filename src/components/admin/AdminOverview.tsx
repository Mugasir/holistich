import { DollarSign, ShoppingCart, Users } from "lucide-react";
import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Order {
  id: string;
  status: string;
  total: number;
  created_at: string;
}

interface AdminOverviewProps {
  totalSales: number;
  orderCount: number;
  unreadMessages: number;
  orders: Order[];
}

const AdminOverview = ({ totalSales, orderCount, unreadMessages, orders }: AdminOverviewProps) => {
  const monthlyData = useMemo(() => {
    const months: Record<string, number> = {};
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
      months[key] = 0;
    }
    orders
      .filter((o) => o.status !== "pending")
      .forEach((o) => {
        const d = new Date(o.created_at);
        const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
        if (key in months) months[key] += o.total;
      });
    return Object.entries(months).map(([month, sales]) => ({ month, sales }));
  }, [orders]);

  return (
    <div className="space-y-6">
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

      <div className="bg-card rounded-xl border border-border/50 p-6">
        <h2 className="font-heading font-semibold text-lg mb-4">Monthly Sales Overview</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" className="text-xs fill-muted-foreground" />
              <YAxis className="text-xs fill-muted-foreground" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(value: number) => [`UGX ${value.toLocaleString()}`, "Sales"]}
                contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
