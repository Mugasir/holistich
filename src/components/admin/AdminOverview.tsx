import { DollarSign, ShoppingCart, Users } from "lucide-react";

interface AdminOverviewProps {
  totalSales: number;
  orderCount: number;
  unreadMessages: number;
}

const AdminOverview = ({ totalSales, orderCount, unreadMessages }: AdminOverviewProps) => (
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
);

export default AdminOverview;
