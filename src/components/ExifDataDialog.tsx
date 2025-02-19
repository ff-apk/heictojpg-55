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
  value?: ExifValue;
  description?: string;
  // There might be additional properties (e.g. attributes) in some cases.
  [key: string]: any;
}

type ExifTags = {
  [key: string]: ExifTag;
};

export function ExifDataDialog({ originalFile, fileName }: ExifDataDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [exifData, setExifData] = useState<ExifTags | null>(null);
  const { toast } = useToast();

  // This helper will flatten the returned EXIF data.
  // If the returned object is already flat (each property has a "value"), we return it as is.
  // Otherwise, we loop over the groups and extract each tag.
  const flattenTags = (tags: any): ExifTags => {
    const formattedTags: ExifTags = {};
    const values = Object.values(tags);
    if (values.length && typeof values[0] === "object" && "value" in values[0]) {
      // The tags object is already flat.
      return tags;
    } else {
      // The tags are grouped. Loop over each group.
      Object.values(tags).forEach((group) => {
        if (group && typeof group === "object") {
          Object.entries(group).forEach(([tagKey, tagValue]) => {
            if (tagValue && typeof tagValue === "object") {
              formattedTags[tagKey] = tagValue as ExifTag;
            }
          });
        }
      });
      return formattedTags;
    }
  };

  const handleExifDataClick = async () => {
    setLoading(true);
    try {
      const arrayBuffer = await originalFile.arrayBuffer();
      // Do not pass expanded:true so that computed values are returned.
      const tags = await ExifReader.load(arrayBuffer);

      const formattedTags = flattenTags(tags);

      if (Object.keys(formattedTags).length === 0) {
        toast({
          title: "Not found",
          description: "The image has no EXIF data",
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
        title: "Not found",
        description: "The image has no EXIF data",
        variant: "destructive",
      });
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  // Returns the computed description (if available) or the value.
  const formatExifValue = (tag: ExifTag): string => {
    if (tag.description) return tag.description;
    
    if (Array.isArray(tag.value)) {
      return tag.value.join(", ");
    }
    
    if (tag.value instanceof Date) {
      return tag.value.toLocaleString();
    }
    
    if (typeof tag.value === "object" && tag.value !== null) {
      return JSON.stringify(tag.value);
    }
    
    return tag.value !== undefined ? String(tag.value) : "";
  };

  // Filter out any internal properties.
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
