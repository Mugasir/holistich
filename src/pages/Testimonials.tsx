import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Amina K.",
    text: "I saw visible hair growth in four weeks. This oil is incredible — my edges are finally coming back!",
    rating: 5,
  },
  {
    name: "David M.",
    text: "My scalp feels healthier and less dry. I've tried many products but this is the only one that works.",
    rating: 5,
  },
  {
    name: "Brian O.",
    text: "The oil is thick, pure and works for my beard. I can tell it's genuine cold pressed. Highly recommend!",
    rating: 5,
  },
  {
    name: "Grace N.",
    text: "I use it on my eyelashes and eyebrows every night. They've become noticeably fuller in just a month.",
    rating: 4,
  },
  {
    name: "Sarah W.",
    text: "Best moisturizer I've found for my skin. It's heavy but absorbs well. Love the natural approach!",
    rating: 5,
  },
  {
    name: "Joseph T.",
    text: "Great product, great price. Supporting local Ugandan farmers makes it even better. Keep it up!",
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <div className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-heading font-bold mb-4">What Our Customers Say</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Real stories from real people who love our castor oil
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className="bg-card rounded-xl p-6 border border-border/50 animate-fade-in-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, si) => (
                  <Star
                    key={si}
                    className={`h-4 w-4 ${si < t.rating ? "text-gold fill-gold" : "text-border"}`}
                  />
                ))}
              </div>
              <p className="text-foreground/90 leading-relaxed mb-4 italic">"{t.text}"</p>
              <p className="font-semibold text-sm text-primary">— {t.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
