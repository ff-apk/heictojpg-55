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

type ExifValue = string | number | Date | Array<any> | { [key: string]: any };

interface ExifTag {
  value: ExifValue;
  description?: string;
}

type ExifTags = {
  [key: string]: ExifTag;
};

// Orientation mappings (numeric values and description-based)
const orientationMapping: Record<number, string> = {
  1: "Normal",
  2: "Flip Horizontal",
  3: "Rotate 180",
  4: "Flip Vertical",
  5: "Transpose (Flip Horizontal & Rotate 270° CW / Left-Bottom)",
  6: "Rotate 90° CW / Right-Top",
  7: "Transverse (Flip Horizontal & Rotate 90° CW / Right-Bottom)",
  8: "Rotate 270° CW / Left-Top",
};

const orientationMappingByDescription: Record<string, string> = {
  "top-left": "Normal",
  "top-right": "Flip Horizontal",
  "bottom-right": "Rotate 180",
  "bottom-left": "Flip Vertical",
  "left-top": "Transpose (Flip Horizontal & Rotate 270° CW / Left-Bottom)",
  "right-top": "Rotate 90° CW / Right-Top",
  "right-bottom": "Transverse (Flip Horizontal & Rotate 90° CW / Right-Bottom)",
  "left-bottom": "Rotate 270° CW / Left-Top",
};

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
      
      // Flatten tags from all groups into a single object
      const formattedTags: ExifTags = {};
      Object.values(tags).forEach((group) => {
        if (typeof group === "object" && group !== null) {
          Object.entries(group).forEach(([tagKey, tagValue]) => {
            if (tagValue && typeof tagValue === "object") {
              formattedTags[tagKey] = tagValue as ExifTag;
            }
          });
        }
      });

      if (Object.keys(formattedTags).length === 0) {
        toast({
          title: "Not found",
          description: "The file has no Exif data",
          variant: "destructive",
        });
        setOpen(false);
        return;
      }
      
      setExifData(formattedTags);
      setOpen(true);
    } catch (error) {
      console.error("Error reading EXIF data:", error);
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

  // Formatter that handles Orientation specifically
  const formatExifValue = (tag: ExifTag, tagKey?: string): string => {
    if (tagKey === "Orientation") {
      // Try numeric mapping first
      const numericOrientation = Number(tag.value);
      if (!isNaN(numericOrientation) && orientationMapping[numericOrientation]) {
        return orientationMapping[numericOrientation];
      }
      // Fallback to description mapping if available
      if (tag.description && orientationMappingByDescription[tag.description.toLowerCase()]) {
        return orientationMappingByDescription[tag.description.toLowerCase()];
      }
    }
    
    // Default formatting for other tags
    if (tag.description) return tag.description;
    if (Array.isArray(tag.value)) return tag.value.join(", ");
    if (tag.value instanceof Date) return tag.value.toLocaleString();
    if (typeof tag.value === "object" && tag.value !== null) return JSON.stringify(tag.value);
    
    return String(tag.value);
  };

  // Filter out any internal properties or null/undefined values
  const filterExifData = (tags: ExifTags): [string, ExifTag][] => {
    return Object.entries(tags).filter(([key, value]) => {
      return !key.startsWith("_") && value !== undefined && value !== null;
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
                    {formatExifValue(tag, key)}
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
