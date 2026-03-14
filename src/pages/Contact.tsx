import { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Contact = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: form.name.trim(),
      email: form.email.trim(),
      message: form.message.trim(),
    });
    setLoading(false);
    if (error) {
      toast({ title: "Failed to send message", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Message sent!", description: "We'll get back to you soon." });
      setForm({ name: "", email: "", message: "" });
    }
  };

  return (
    <div className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-heading font-bold mb-4">Get In Touch</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Have a question or want to place a bulk order? We'd love to hear from you.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-heading font-semibold mb-6">Contact Information</h2>
              <div className="space-y-5">
                <a href="mailto:holistichavenorganics@gmail.com" className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm">holistichavenorganics@gmail.com</span>
                </a>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-sm space-y-1">
                    <p>+256 709 047 857</p>
                    <p>+256 747 917 961</p>
                    <p>+256 742 023 161</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-muted-foreground">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-sm">
                    <p>Kampala, Uganda</p>
                    <p>P.O. Box 158012, Kampala (U)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Google Maps */}
            <div className="rounded-xl overflow-hidden border border-border h-64">
              <iframe
                title="Holistic Haven Organics Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d127672.75772090819!2d32.52291199397498!3d0.3135611581498!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x177dbc0f90af4c41%3A0x1ba56f407000b00!2sKampala%2C%20Uganda!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-card rounded-2xl p-6 md:p-8 border border-border/50">
            <h2 className="text-xl font-heading font-semibold mb-6">Send Us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1.5">Full Name</label>
                <Input id="name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Your name" maxLength={100} />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1.5">Email Address</label>
                <Input id="email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="your@email.com" maxLength={255} />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-1.5">Message</label>
                <Textarea id="message" value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} placeholder="How can we help you?" rows={5} maxLength={1000} />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                <Send className="h-4 w-4 mr-2" />
                {loading ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
