import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Calculator, RefreshCw, Settings } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { ManualInput } from "@/types/adminTransaction";
import { useToast } from "@/hooks/use-toast";

interface ManualControlsPanelProps {
  manualInputs: ManualInput;
  onUpdateInputs: (inputs: Partial<ManualInput>) => void;
  onRecalculate: () => void;
}

export const ManualControlsPanel = ({ 
  manualInputs, 
  onUpdateInputs, 
  onRecalculate 
}: ManualControlsPanelProps) => {
  const [roiMade, setRoiMade] = useState(manualInputs.roiMadeThisMonth.toString());
  const [roiUsed, setRoiUsed] = useState(manualInputs.roiUsedForPayouts.toString());
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const calculatedProfit = parseFloat(roiMade || '0') - parseFloat(roiUsed || '0');

  const handleUpdateInputs = async () => {
    setIsUpdating(true);
    try {
      onUpdateInputs({
        roiMadeThisMonth: parseFloat(roiMade || '0'),
        roiUsedForPayouts: parseFloat(roiUsed || '0'),
      });
      
      toast({
        title: "Manual inputs updated",
        description: "ROI calculations have been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update manual inputs",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRecalculate = () => {
    onRecalculate();
    toast({
      title: "Net profit recalculated",
      description: `New net profit: ${formatCurrency(calculatedProfit)}`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Manual Financial Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Values Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
          <div>
            <Label className="text-xs text-muted-foreground">Current ROI Made</Label>
            <p className="text-lg font-semibold text-success">
              {formatCurrency(manualInputs.roiMadeThisMonth)}
            </p>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Current ROI Used</Label>
            <p className="text-lg font-semibold text-destructive">
              {formatCurrency(manualInputs.roiUsedForPayouts)}
            </p>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Calculated Profit</Label>
            <p className="text-lg font-semibold">
              {formatCurrency(manualInputs.roiMadeThisMonth - manualInputs.roiUsedForPayouts)}
            </p>
          </div>
        </div>

        {/* Manual Input Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="roiMade">ROI Made This Month ($)</Label>
            <Input
              id="roiMade"
              type="number"
              step="0.01"
              value={roiMade}
              onChange={(e) => setRoiMade(e.target.value)}
              placeholder="Enter total ROI made"
            />
          </div>
          <div>
            <Label htmlFor="roiUsed">ROI Used for Payouts ($)</Label>
            <Input
              id="roiUsed"
              type="number"
              step="0.01"
              value={roiUsed}
              onChange={(e) => setRoiUsed(e.target.value)}
              placeholder="Enter ROI used for payouts"
            />
          </div>
        </div>

        {/* Calculated Preview */}
        {(roiMade !== manualInputs.roiMadeThisMonth.toString() || 
          roiUsed !== manualInputs.roiUsedForPayouts.toString()) && (
          <div className="p-4 border-2 border-dashed border-primary/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="w-4 h-4" />
              <span className="font-medium">Preview Calculation</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">New ROI Made:</span>
                <p className="font-medium text-success">{formatCurrency(parseFloat(roiMade || '0'))}</p>
              </div>
              <div>
                <span className="text-muted-foreground">New ROI Used:</span>
                <p className="font-medium text-destructive">{formatCurrency(parseFloat(roiUsed || '0'))}</p>
              </div>
              <div>
                <span className="text-muted-foreground">New Profit:</span>
                <p className="font-medium">{formatCurrency(calculatedProfit)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={handleUpdateInputs}
            disabled={isUpdating || (roiMade === manualInputs.roiMadeThisMonth.toString() && 
                                   roiUsed === manualInputs.roiUsedForPayouts.toString())}
            className="flex-1"
          >
            {isUpdating ? "Updating..." : "Update Manual Inputs"}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="flex-1">
                <RefreshCw className="w-4 h-4 mr-2" />
                Recalculate Net Profit
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Recalculate Net Profit</AlertDialogTitle>
                <AlertDialogDescription>
                  This will update the net profit balance based on current manual inputs:
                  <div className="mt-3 p-3 bg-muted rounded-md">
                    <div className="space-y-1 text-sm">
                      <div>ROI Made: {formatCurrency(parseFloat(roiMade || '0'))}</div>
                      <div>ROI Used: {formatCurrency(parseFloat(roiUsed || '0'))}</div>
                      <div className="font-medium border-t pt-1">
                        New Net Profit: {formatCurrency(calculatedProfit)}
                      </div>
                    </div>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleRecalculate}>
                  Confirm Recalculation
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Last Updated Info */}
        <div className="text-xs text-muted-foreground border-t pt-3">
          Last recalculated: {formatDate(manualInputs.lastRecalculated)}
        </div>
      </CardContent>
    </Card>
  );
};