import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2, Link, Calculator } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalInvestment: number;
  monthlyWithdrawal: number;
  returnRate: number;
  timePeriod: number;
}

const ShareDialog = ({
  open,
  onOpenChange,
  totalInvestment,
  monthlyWithdrawal,
  returnRate,
  timePeriod,
}: ShareDialogProps) => {
  const baseUrl = "https://swp-calculator.mutualfundjournal.in";

  const generateShareableLink = (includeParams: boolean = true) => {
    if (!includeParams) return baseUrl;
    
    const params = new URLSearchParams({
      ti: totalInvestment.toString(),
      mw: monthlyWithdrawal.toString(),
      rr: returnRate.toString(),
      tp: timePeriod.toString(),
    });
    return `${baseUrl}?${params.toString()}`;
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "SWP Calculator",
          text: "SWP Calculator - Systematic Withdrawal Plan Calculator",
          url: generateShareableLink(false),
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generateShareableLink(false));
    toast({
      title: "Link copied to clipboard",
      duration: 5000,
    });
  };

  const handleShareCalculation = () => {
    navigator.clipboard.writeText(generateShareableLink(true));
    toast({
      title: "Link copied to clipboard",
      description: "Share this link to show your current calculation",
      duration: 5000,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle>Sharing is caring 🥰</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {navigator.share && (
            <Button onClick={handleShare} className="w-full" variant="outline">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          )}
          <Button onClick={handleCopyLink} className="w-full" variant="outline">
            <Link className="mr-2 h-4 w-4" />
            Copy Link
          </Button>
          <Button onClick={handleShareCalculation} className="w-full">
            <Calculator className="mr-2 h-4 w-4" />
            Share Current Calculation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;
