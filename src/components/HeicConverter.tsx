
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Download, Info, RefreshCcw } from "lucide-react";
import { useHeicConverter } from "@/hooks/useHeicConverter";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { MAX_FILES } from "@/constants/upload";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const HeicConverter = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFormatSelectOpen, setIsFormatSelectOpen] = useState(false);
  const {
    images,
    isDragging,
    format,
    isConverting,
    setFormat,
    handleFiles,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    handleExifData,
    downloadImage,
    reset,
    openImageInNewTab,
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
          disabled={isConverting}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-3">
              <Upload className="w-6 h-6" />
              <span>{isDragging ? "Drop Images Here" : "Upload or Drop Images"}</span>
            </div>
            <span className="text-sm text-muted-foreground">Max {MAX_FILES} images at once</span>
          </div>
        </Button>

        <div className="flex justify-center space-x-4">
          <div className={`flex justify-center transition-all duration-500 ${
            isFormatSelectOpen ? "mb-32" : "mb-0"
          }`}>
            <Select 
              value={format} 
              onValueChange={(value: "jpg" | "png" | "webp") => setFormat(value)}
              disabled={isConverting}
              open={isFormatSelectOpen}
              onOpenChange={setIsFormatSelectOpen}
            >
              <SelectTrigger className={cn(
                "w-[90px] focus:ring-0 focus:outline-none",
                isConverting && "opacity-50 cursor-not-allowed"
              )}>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jpg">JPG</SelectItem>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="webp">WEBP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {images.length > 0 && (
            <Button 
              onClick={reset} 
              variant="outline" 
              className="w-30 gap-2"
              disabled={isConverting}
            >
              <RefreshCcw className={cn("w-5 h-5", isConverting && "animate-spin")} />
              Reset
            </Button>
          )}
        </div>

        {images.map((image, index) => (
          <React.Fragment key={image.id}>
            <div className="space-y-4">
              <div 
                className={cn(
                  "border border-border rounded-lg overflow-hidden cursor-pointer",
                  "hover:border-primary transition-colors duration-200",
                  isConverting && "opacity-50 pointer-events-none"
                )}
                onClick={() => openImageInNewTab(image.id)}
                title="Click to open in new tab"
              >
                <img src={image.previewUrl} alt={image.fileName} className="w-full h-auto" />
              </div>
              <p className="text-center text-sm text-muted-foreground">
                {image.fileName}
              </p>
              <div className="flex justify-center gap-2">
                <Button 
                  onClick={() => downloadImage(image.id)}
                  className="gap-2"
                  disabled={isConverting}
                >
                  <Download className="w-5 h-5" />
                  Download
                </Button>
                <Button 
                  onClick={() => handleExifData(image.id)}
                  variant="outline"
                  className="gap-2"
                  disabled={isConverting}
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

