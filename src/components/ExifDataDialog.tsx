
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import ExifReader from "exifreader";
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

interface ExifDataDialogProps {
  originalFile: File;
  fileName: string;
}

interface ExifTag {
  value: any;
  description?: string;
}

interface ExifTags {
  [key: string]: ExifTag;
}

export function ExifDataDialog({ originalFile, fileName }: ExifDataDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [exifData, setExifData] = useState<ExifTags | null>(null);
  const { toast } = useToast();

  const handleExifDataClick = async () => {
    setLoading(true);
    try {
      const arrayBuffer = await originalFile.arrayBuffer();
      const tags = await ExifReader.load(arrayBuffer, { expanded: true });
      
      if (!tags || Object.keys(tags).length === 0) {
        toast({
          title: "Not found",
          description: "The file has no Exif data",
          variant: "destructive",
        });
        setOpen(false);
        return;
      }
      
      setExifData(tags);
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

  const formatExifValue = (tag: ExifTag): string => {
    if (tag.description) {
      return tag.description;
    }
    
    const value = tag.value;
    
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    
    if (value instanceof Date) {
      return value.toLocaleString();
    }
    
    if (typeof value === "object" && value !== null) {
      return JSON.stringify(value);
    }
    
    return String(value);
  };

  const filterExifData = (tags: ExifTags): [string, ExifTag][] => {
    return Object.entries(tags).filter(([key, value]) => {
      // Filter out undefined or null values
      if (!value || !value.value) return false;
      // Filter out internal ExifReader properties
      if (key.startsWith('_')) return false;
      return true;
    });
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
              {filterExifData(exifData).map(([key, tag]) => (
                <React.Fragment key={key}>
                  <div className="font-medium text-sm text-muted-foreground">
                    {key}
                  </div>
                  <div className="text-sm">
                    {formatExifValue(tag)}
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
