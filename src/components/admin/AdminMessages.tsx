import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface ContactMsg {
  id: string;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface AdminMessagesProps {
  messages: ContactMsg[];
  fetchMessages: () => void;
}

const AdminMessages = ({ messages, fetchMessages }: AdminMessagesProps) => {
  const markRead = async (id: string) => {
    await supabase.from("contact_messages").update({ is_read: true }).eq("id", id);
    fetchMessages();
  };

  return (
    <div className="space-y-3">
      {messages.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No messages</p>
      ) : (
        messages.map((m) => (
          <div key={m.id} className={`bg-card rounded-xl border border-border/50 p-5 ${!m.is_read ? "border-l-4 border-l-primary" : ""}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">{m.name} <span className="text-sm text-muted-foreground">({m.email})</span></p>
                <p className="text-sm text-muted-foreground mt-1">{m.message}</p>
                <p className="text-xs text-muted-foreground mt-2">{new Date(m.created_at).toLocaleString()}</p>
              </div>
              {!m.is_read && (
                <Button variant="ghost" size="sm" onClick={() => markRead(m.id)}>
                  <Eye className="h-4 w-4 mr-1" /> Mark read
                </Button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminMessages;
