
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Download, Info, RefreshCcw } from "lucide-react";
import { useHeicConverter } from "@/hooks/useHeicConverter";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const HeicConverter = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    images,
    isDragging,
    format,
    setFormat,
    handleFiles,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    handleExifData,
    downloadImage,
    reset,
  } = useHeicConverter();

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple
          accept=".heic,.heif"
          onChange={(e) => {
            if (e.target.files) {
              handleFiles(Array.from(e.target.files));
              e.target.value = '';
            }
          }}
        />

        <Button
          variant="outline"
          className={cn(
            "w-full py-8 text-lg gap-3 relative",
            "border-2 border-dashed",
            isDragging ? "border-primary bg-primary/5" : "border-border",
            "transition-colors duration-200"
          )}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-6 h-6" />
          {isDragging ? "Drop Images Here" : "Upload or Drop Images"}
        </Button>

        <div className="flex justify-center space-x-4">
          <Select 
            value={format} 
            onValueChange={(value: "jpg" | "png" | "webp") => setFormat(value)}
          >
            <SelectTrigger className="w-[90px] focus:ring-0 focus:outline-none">
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="jpg">JPG</SelectItem>
              <SelectItem value="png">PNG</SelectItem>
              <SelectItem value="webp">WEBP</SelectItem>
            </SelectContent>
          </Select>

          {images.length > 0 && (
            <Button 
              onClick={reset} 
              variant="outline" 
              className="w-30 gap-2"
            >
              <RefreshCcw className="w-5 h-5" />
              Reset
            </Button>
          )}
        </div>

        {images.map((image, index) => (
          <React.Fragment key={image.id}>
            <div className="space-y-4">
              <div className="border border-border rounded-lg overflow-hidden">
                <img src={image.previewUrl} alt={image.fileName} className="w-full h-auto" />
              </div>
              <p className="text-center text-sm text-muted-foreground">
                {image.fileName}
              </p>
              <div className="flex justify-center gap-2">
                <Button 
                  onClick={() => downloadImage(image.id)}
                  className="gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download
                </Button>
                <Button 
                  onClick={() => handleExifData(image.id)}
                  variant="outline"
                  className="gap-2"
                >
                  <Info className="w-5 h-5" />
                  Exif Data
                </Button>
              </div>
            </div>
            {index < images.length - 1 && <Separator className="my-6" />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default HeicConverter;
