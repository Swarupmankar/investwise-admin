import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface TXIDCopyProps {
  txid: string;
  className?: string;
  showFullTxid?: boolean;
}

export function TXIDCopy({ txid, className, showFullTxid = false }: TXIDCopyProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(txid);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Transaction ID copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy transaction ID",
        variant: "destructive",
      });
    }
  };

  const displayTxid = showFullTxid ? txid : `${txid.slice(0, 8)}...${txid.slice(-8)}`;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <code className="text-sm font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
        {displayTxid}
      </code>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={handleCopy}
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}