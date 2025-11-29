// src/components/adminAccounting/AdminReplenishPrincipalForm.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ArrowDownCircle, Upload, X } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { AdminAccount } from "@/types/adminTransaction";
import { useToast } from "@/hooks/use-toast";

const replenishSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  purpose: z.string().min(1, "Purpose is required"),
  notes: z.string().optional(),
  tronScanLink: z.string().optional(),
});

type ReplenishFormData = z.infer<typeof replenishSchema>;

interface AdminReplenishPrincipalFormProps {
  account: AdminAccount;
  onReplenish: (
    amount: number,
    purpose: string,
    notes?: string,
    proofScreenshot?: File | undefined,
    tronScanLink?: string
  ) => Promise<any> | void;
}

export const AdminReplenishPrincipalForm = ({
  account,
  onReplenish,
}: AdminReplenishPrincipalFormProps) => {
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<ReplenishFormData>({
    resolver: zodResolver(replenishSchema),
    defaultValues: { amount: "", purpose: "", notes: "", tronScanLink: "" },
  });

  const watchedAmount = form.watch("amount");

  const availableToReplenish = Math.max(
    Math.abs(Number(account.currentPrincipalWithdrawn ?? 0)),
    0
  );

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 5MB",
          variant: "destructive",
        });
        return;
      }
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/pdf",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please select a JPEG, PNG, or PDF file",
          variant: "destructive",
        });
        return;
      }
      setProofFile(file);
    }
  };

  const removeFile = () => setProofFile(null);

  const onSubmit = async (data: ReplenishFormData) => {
    const amount = parseFloat(data.amount);
    if (amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Amount must be greater than 0",
        variant: "destructive",
      });
      return;
    }
    if (amount > availableToReplenish) {
      toast({
        title: "Amount exceeds current principal deficit",
        description: `Available to Replenish (current deficit): ${formatCurrency(
          availableToReplenish
        )}`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const proofScreenshot = proofFile ?? undefined;
      await onReplenish(
        amount,
        data.purpose,
        data.notes,
        proofScreenshot,
        data.tronScanLink
      );

      toast({
        title: "Replenishment logged successfully",
        description: `${formatCurrency(
          amount
        )} replenished to Principal deficit`,
      });
      form.reset();
      setProofFile(null);
    } catch (err) {
      toast({
        title: "Error",
        description:
          (err as any)?.message ||
          "Failed to log replenishment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowDownCircle className="w-5 h-5" />
          Replenish Principal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (USDT)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0.00"
                        type="number"
                        step="0.01"
                        min="0"
                        max={availableToReplenish}
                        {...field}
                      />
                    </FormControl>
                    <div className="text-sm text-muted-foreground">
                      Available to Replenish (current deficit):{" "}
                      {formatCurrency(availableToReplenish)}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purpose</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Return of temporary principal usage"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional details about this replenishment..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Proof Screenshot (Optional)</Label>
                <div className="mt-2">
                  {proofFile ? (
                    <div className="flex items-center gap-2 p-2 border rounded-md">
                      <span className="text-sm truncate flex-1">
                        {proofFile.name}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeFile}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="relative">
                      <Input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Proof
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <FormField
                control={form.control}
                name="tronScanLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>TronScan Link (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://tronscan.org/#/transaction/..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {watchedAmount && parseFloat(watchedAmount) > 0 && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Replenishment Preview</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="ml-2 font-medium">
                      {formatCurrency(parseFloat(watchedAmount))}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      Remaining Deficit:
                    </span>
                    <span className="ml-2 font-medium">
                      {formatCurrency(
                        availableToReplenish - parseFloat(watchedAmount)
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
              size="lg"
            >
              {isSubmitting
                ? "Logging Replenishment..."
                : "Log Principal Replenishment"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
