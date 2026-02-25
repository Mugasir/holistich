import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import castorOilImg from "@/assets/castor-oil.png";

const products = [
  {
    id: "castor-oil-100ml",
    name: "Pure Cold Pressed Castor Oil",
    size: "100ml",
    price: 25000,
  },
  {
    id: "castor-oil-50ml",
    name: "Pure Cold Pressed Castor Oil",
    size: "50ml",
    price: 15000,
  },
];

const Shop = () => {
  const { addItem } = useCart();

  return (
    <div className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-heading font-bold mb-4">Our Products</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            100% natural, cold-pressed castor oil sourced from trusted local farmers in Uganda
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-card rounded-2xl border border-border/50 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="bg-gradient-to-br from-secondary to-muted p-8 flex items-center justify-center">
                <img
                  src={castorOilImg}
                  alt={`${product.name} - ${product.size}`}
                  className="w-40 h-auto group-hover:scale-105 transition-transform duration-300 drop-shadow-lg"
                />
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="font-heading font-semibold text-xl">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{product.size}</p>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Suitable for hair growth, scalp treatment, beard care, eyelashes, eyebrows, 
                  and deep skin moisturization. No additives, no chemicals.
                </p>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-2xl font-heading font-bold text-primary">
                    UGX {product.price.toLocaleString()}
                  </span>
                  <Button
                    onClick={() => addItem({ id: product.id, name: product.name, size: product.size, price: product.price, image: castorOilImg })}
                    size="sm"
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Shop;
