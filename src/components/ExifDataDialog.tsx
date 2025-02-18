
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { parse } from "exifr";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const ORIENTATION_MAP: { [key: number]: string } = {
  1: "Normal",
  2: "Flip Horizontal",
  3: "Rotate 180",
  4: "Flip Vertical",
  5: "Flip Horizontal and Rotate 270 CW/left-bottom",
  6: "Rotate 90 CW/right-top",
  7: "Flip Horizontal and Rotate 90 CW/right-bottom",
  8: "Rotate 270 CW/left-top"
};

interface ExifDataDialogProps {
  originalFile: File;
  fileName: string;
}

export function ExifDataDialog({ originalFile, fileName }: ExifDataDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [exifData, setExifData] = useState<Record<string, any> | null>(null);
  const { toast } = useToast();

  const handleExifDataClick = async () => {
    setLoading(true);
    try {
      const data = await parse(originalFile);
      if (!data || Object.keys(data).length === 0) {
        toast({
          title: "Not found",
          description: "The file has no Exif data",
          variant: "destructive",
        });
        setOpen(false);
        return;
      }
      setExifData(data);
      setOpen(true);
    } catch (error) {
      console.error('Error reading EXIF data:', error);
      toast({
        title: "Error",
        description: "Failed to read EXIF data",
        variant: "destructive",
      });
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const formatExifValue = (key: string, value: any): string => {
    if (key === "Orientation" && typeof value === "number") {
      return `${value} - ${ORIENTATION_MAP[value] || value}`;
    }
    if (value instanceof Date) {
      return value.toLocaleString();
    }
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    if (typeof value === "number") {
      return value.toString();
    }
    return String(value);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={handleExifDataClick}
          variant="outline"
          className="gap-2"
          disabled={loading}
        >
          <Info className="w-5 h-5" />
          {loading ? "Loading..." : "Exif Data"}
        </Button>
      </DialogTrigger>
      {exifData && (
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>EXIF Data for {fileName}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] w-full rounded-md border p-4">
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(exifData).map(([key, value]) => (
                <React.Fragment key={key}>
                  <div className="font-medium text-sm text-muted-foreground">
                    {key}
                  </div>
                  <div className="text-sm">
                    {formatExifValue(key, value)}
                  </div>
                </React.Fragment>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      )}
    </Dialog>
  );
}
