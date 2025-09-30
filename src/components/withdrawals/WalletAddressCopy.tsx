import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface WalletAddressCopyProps {
  address: string;
  className?: string;
  showFullAddress?: boolean;
}

export function WalletAddressCopy({ address, className, showFullAddress = false }: WalletAddressCopyProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Wallet address copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy wallet address",
        variant: "destructive",
      });
    }
  };

  const displayAddress = showFullAddress ? address : `${address.slice(0, 8)}...${address.slice(-8)}`;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <code className="text-sm font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
        {displayAddress}
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