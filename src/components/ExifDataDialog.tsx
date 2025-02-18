
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface ExifDataDialogProps {
  exifData: Record<string, any> | null;
  fileName: string;
}

const ExifDataDialog: React.FC<ExifDataDialogProps> = ({ exifData, fileName }) => {
  const { toast } = useToast();

  const copyToClipboard = () => {
    if (!exifData) return;
    navigator.clipboard.writeText(JSON.stringify(exifData, null, 2));
    toast({
      title: "Copied to clipboard",
      description: "EXIF data has been copied to your clipboard",
    });
  };

  const downloadAsJson = () => {
    if (!exifData) return;
    const blob = new Blob([JSON.stringify(exifData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName.split('.')[0]}_exif.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadAsCsv = () => {
    if (!exifData) return;
    const rows = Object.entries(exifData).map(([key, value]) => {
      return `"${key}","${String(value).replace(/"/g, '""')}"`;
    });
    const csv = `Property,Value\n${rows.join('\n')}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName.split('.')[0]}_exif.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatValue = (value: any): string => {
    if (value instanceof Date) {
      return value.toLocaleString();
    }
    if (typeof value === 'number') {
      return value.toString();
    }
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    }
    return String(value);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Info className="w-5 h-5" />
          Exif Data
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>EXIF Data for {fileName}</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto max-h-[calc(80vh-200px)]">
          {exifData ? (
            <div className="space-y-4">
              {Object.entries(exifData).map(([key, value]) => (
                <div key={key} className="grid grid-cols-3 gap-4 py-2 border-b border-border">
                  <div className="font-medium text-sm">{key}</div>
                  <div className="col-span-2 text-sm break-words">{formatValue(value)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No EXIF data available
            </div>
          )}
        </div>
        <DialogFooter className="flex justify-between items-center sm:justify-between">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Export As</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={downloadAsJson}>
                JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={downloadAsCsv}>
                CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={copyToClipboard} disabled={!exifData}>
            Copy to Clipboard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExifDataDialog;
