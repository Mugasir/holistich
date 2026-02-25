import { Link } from "react-router-dom";
import { Leaf, Droplets, Heart, Shield, Sparkles, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import castorOilImg from "@/assets/castor-oil.png";

const benefits = [
  { icon: Sparkles, title: "Hair Growth", desc: "Stimulates thicker, healthier hair growth naturally" },
  { icon: Droplets, title: "Deep Moisturizing", desc: "Intense hydration for skin and scalp" },
  { icon: Heart, title: "Anti-inflammatory", desc: "Soothes irritation and reduces inflammation" },
  { icon: Shield, title: "Anti-bacterial", desc: "Natural antibacterial properties protect skin" },
  { icon: Sun, title: "Lessens Wrinkles", desc: "Promotes youthful, radiant skin" },
  { icon: Leaf, title: "100% Natural", desc: "No additives, no chemicals — pure nature" },
];

const Index = () => {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-secondary via-background to-muted">
        <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in-up">
              <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
                100% Organic · Cold Pressed
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold leading-tight text-foreground">
                Pure Castor Oil,{" "}
                <span className="text-primary italic">Straight from Nature</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
                Experience Nature's touch, perfected by Holistic Haven Organics Limited. 
                Cold-pressed from trusted Ugandan farms for your hair, skin, and wellness.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="text-base px-8">
                  <Link to="/shop">Shop Now</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-base px-8">
                  <Link to="/about">Our Story</Link>
                </Button>
              </div>
            </div>
            <div className="flex justify-center lg:justify-end animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <div className="relative">
                <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl scale-110" />
                <img
                  src={castorOilImg}
                  alt="Pure Cold Pressed Castor Oil by Holistic Haven Organics"
                  className="relative w-64 md:w-80 lg:w-96 h-auto drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Story */}
      <section className="bg-card py-16 md:py-24">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
            The Nature's Bounty
          </h2>
          <p className="text-muted-foreground leading-relaxed text-lg">
            Born in the heart of Kampala, Uganda, Holistic Haven Organics is dedicated to 
            bringing you the purest cold-pressed castor oil. We partner directly with local 
            farmers to ensure every drop is ethically sourced, naturally processed, and 
            packed with the nutrients your body deserves.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Why Our Castor Oil?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Discover the natural benefits of pure, unrefined castor oil
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b, i) => (
              <div
                key={b.title}
                className="bg-card rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-border/50 animate-fade-in-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <b.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2">{b.title}</h3>
                <p className="text-sm text-muted-foreground">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            Ready to Experience Pure Nature?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
            Start your natural wellness journey today with our cold-pressed castor oil. 
            Available in 50ml and 100ml sizes.
          </p>
          <Button asChild size="lg" variant="secondary" className="text-base px-8">
            <Link to="/shop">Browse Products</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
