import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useClientsData } from "@/hooks/useClientsData";
import { Trash2 } from "lucide-react";

export function AdminNotes({ clientId }: { clientId: string }) {
  const [note, setNote] = useState("");
  const [tag, setTag] = useState("Support");
  const { toast } = useToast();
  const { getNotesByClientId, addAdminNote, deleteAdminNote } = useClientsData();

  const notes = useMemo(() => getNotesByClientId(clientId), [clientId, getNotesByClientId]);

  const addNote = () => {
    if (!note.trim()) return;
    addAdminNote(clientId, tag, note);
    toast({ title: "Note added", description: `Tagged: ${tag}` });
    setNote("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Notes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Select value={tag} onValueChange={setTag}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Tag" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="KYC">KYC</SelectItem>
              <SelectItem value="Risk">Risk</SelectItem>
              <SelectItem value="Payment">Payment</SelectItem>
              <SelectItem value="Support">Support</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Textarea rows={4} placeholder="Add a private note..." value={note} onChange={(e) => setNote(e.target.value)} />
        <Button size="sm" onClick={addNote}>Add note</Button>
        <div className="text-xs text-muted-foreground">Notes are private and only visible to admins.</div>

        <div className="pt-2 space-y-2 max-h-64 overflow-y-auto">
          {notes.length === 0 ? (
            <div className="text-xs text-muted-foreground">No notes yet.</div>
          ) : (
            notes.map(n => (
              <div key={n.id} className="border border-border rounded p-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="font-medium">{n.tag}</div>
                  <div className="text-muted-foreground">{new Date(n.createdAt).toLocaleString()}</div>
                </div>
                <div className="text-sm mt-1 whitespace-pre-wrap">{n.text}</div>
                <div className="flex justify-end mt-2">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => deleteAdminNote(n.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
