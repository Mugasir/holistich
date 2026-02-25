import { UserPlus, ShoppingCart, CreditCard, Truck } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Create Your Account",
    desc: "Sign up with your details and verify with a one-time password sent to your email.",
  },
  {
    icon: ShoppingCart,
    title: "Choose Your Oil Size",
    desc: "Browse our 50ml and 100ml options and add your preferred size to the cart.",
  },
  {
    icon: CreditCard,
    title: "Select Payment Method",
    desc: "Pay securely using card payment or Mobile Money (MTN & Airtel Uganda).",
  },
  {
    icon: Truck,
    title: "Receive Your Order",
    desc: "Get your order confirmation via email and enjoy fast delivery to your doorstep.",
  },
];

const HowItWorks = () => {
  return (
    <div className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl font-heading font-bold mb-4">How It Works</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Getting your pure castor oil is simple — just four easy steps
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-0">
          {steps.map((step, i) => (
            <div key={step.title} className="flex gap-6 animate-fade-in-up" style={{ animationDelay: `${i * 0.15}s` }}>
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-lg">
                  <step.icon className="h-6 w-6" />
                </div>
                {i < steps.length - 1 && <div className="w-0.5 h-full bg-border my-2" />}
              </div>
              <div className="pb-12">
                <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                  Step {i + 1}
                </span>
                <h3 className="text-xl font-heading font-semibold mt-1 mb-2">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
