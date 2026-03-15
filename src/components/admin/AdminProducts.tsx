import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  size: string;
  price: number;
  description: string;
  is_active: boolean;
}

interface AdminProductsProps {
  products: Product[];
  fetchProducts: () => void;
}

const AdminProducts = ({ products, fetchProducts }: AdminProductsProps) => {
  const { toast } = useToast();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({ name: "Pure Cold Pressed Castor Oil", size: "", price: "", description: "" });

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

  return (
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
  );
};

export default AdminProducts;
