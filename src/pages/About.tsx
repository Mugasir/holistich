import { Leaf, Heart, Users } from "lucide-react";

const values = [
  {
    icon: Leaf,
    title: "Our Mission",
    desc: "To provide 100% pure, cold-pressed castor oil that nourishes the body naturally. We believe in the power of nature to heal, restore, and beautify — without chemicals or additives.",
  },
  {
    icon: Heart,
    title: "Our Vision",
    desc: "To become East Africa's leading organic wellness brand, championing natural beauty solutions rooted in Ugandan heritage and sustainable farming practices.",
  },
  {
    icon: Users,
    title: "Supporting Local Farmers",
    desc: "Every bottle of our castor oil directly supports Ugandan farming communities. We source our seeds from trusted local farmers, ensuring fair trade practices and sustainable agriculture.",
  },
];

const About = () => {
  return (
    <div className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl font-heading font-bold mb-4">About Us</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
            Holistic Haven Organics Limited is a Ugandan organic wellness brand born from a 
            deep love for nature and a commitment to pure, honest products. Based in Kampala, 
            we bring you cold-pressed castor oil that is as authentic as the land it comes from.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {values.map((v, i) => (
            <div
              key={v.title}
              className="bg-card rounded-2xl p-8 border border-border/50 text-center animate-fade-in-up"
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <v.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-heading font-semibold mb-3">{v.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">{v.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-20 bg-primary text-primary-foreground rounded-2xl p-8 md:p-12 max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-heading font-bold mb-4">
            "The Nature's Bounty"
          </h2>
          <p className="text-primary-foreground/80 leading-relaxed max-w-2xl mx-auto">
            We are more than just a brand — we are a movement towards natural, chemical-free 
            wellness. Every product we offer is a testament to our dedication to purity, 
            quality, and the incredible bounty of Ugandan nature.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
