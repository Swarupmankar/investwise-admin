import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface BalanceEntryFormProps {
  /**
   * onSubmit should be async and return a boolean (success) or throw.
   * Example: async (amount, notes) => { await createCurrentBalance({ amount, notes }); return true; }
   */
  onSubmit: (balance: number, notes?: string) => Promise<any> | any;
  submitting?: boolean;
}

export const BalanceEntryForm = ({
  onSubmit,
  submitting = false,
}: BalanceEntryFormProps) => {
  const [balance, setBalance] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const disabled = submitting || isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const balanceAmount = parseFloat(balance);
    if (Number.isNaN(balanceAmount) || balanceAmount < 0) {
      toast({
        title: "Invalid Balance",
        description: "Please enter a valid positive balance amount.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // allow onSubmit to be async (mutation wrapper)
      await Promise.resolve(onSubmit(balanceAmount, notes.trim()));
      setBalance("");
      setNotes("");
      toast({
        title: "Balance Updated",
        description: "Balance recorded successfully.",
      });
    } catch (err: any) {
      console.error("BalanceEntryForm submit error", err);
      toast({
        title: "Error",
        description:
          err?.message ?? "Failed to update balance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-gradient-card border-card-border shadow-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Enter Current Balance
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="balance" className="text-foreground">
              Current Balance Amount
            </Label>
            <Input
              id="balance"
              type="number"
              step="0.01"
              min="0"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              placeholder="Enter current fund availability"
              className="bg-background border-card-border text-foreground"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-foreground">
              Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any relevant notes or tags"
              className="bg-background border-card-border text-foreground resize-none"
              rows={3}
            />
          </div>

          <Button
            type="submit"
            disabled={disabled || !balance}
            className="w-full"
          >
            {disabled ? "Updating..." : "Update Balance"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
