
import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Download, RefreshCcw, Pencil, FolderOpen, ImageIcon } from "lucide-react";
import { useHeicConverter } from "@/hooks/useHeicConverter";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { MAX_FILES } from "@/constants/upload";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { ExifDataDialog } from "@/components/ExifDataDialog";
import {
  downloadAllImages,
  downloadImage,
  openImageInNewTab
} from "@/utils/fileManagementUtils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const HeicConverter = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [isFormatSelectOpen, setIsFormatSelectOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState<'image' | 'folder'>(() => 
    (localStorage.getItem('heic-selection-mode') as 'image' | 'folder') || 'image'
  );
  const [editingName, setEditingName] = useState("");
  const [qualityInput, setQualityInput] = useState("");
  const { toast } = useToast();

  const {
    images,
    isDragging,
    format,
    isConverting,
    editState,
    quality,
    progress,
    showProgress,
    totalImages,
    convertedCount,
    setFormat,
    setQuality,
    handleFiles,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    downloadImage,
    reset,
    openImageInNewTab,
    startEditing,
    cancelEditing,
    handleRename,
    handleReconversion,
  } = useHeicConverter();

  useEffect(() => {
    if (folderInputRef.current) {
      folderInputRef.current.setAttribute("directory", "");
      folderInputRef.current.setAttribute("webkitdirectory", "");
    }
  }, []);

  useEffect(() => {
    setQualityInput(quality.toString());
  }, [quality]);

  useEffect(() => {
    if (images.length > 0) {
      handleReconversion(undefined, 'format', format);
    }
  }, [format]);

  const handleModeChange = (value: string) => {
    if (value) {
      const newMode = value as 'image' | 'folder';
      setSelectionMode(newMode);
      localStorage.setItem('heic-selection-mode', newMode);
    }
  };

  const handleUploadClick = () => {
    if (selectionMode === 'folder') {
      folderInputRef.current?.click();
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleEditStart = (imageId: string, currentName: string) => {
    const baseName = currentName.substring(0, currentName.lastIndexOf('.'));
    setEditingName(baseName);
    startEditing(imageId);
  };

  const handleEditSubmit = (imageId: string, event?: React.FormEvent) => {
    event?.preventDefault();
    if (editingName.trim() !== "") {
      handleRename(imageId, editingName);
    }
    setEditingName("");
  };

  const handleEditCancel = () => {
    setEditingName("");
    cancelEditing();
  };

  const handleQualityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (value === '' || value === '.' || value.match(/^\d*\.?\d{0,2}$/)) {
      setQualityInput(value);
    }
  };

  const handleQualityInputBlur = () => {
    let numValue = parseFloat(qualityInput);
    if (isNaN(numValue) || numValue < 0) {
      numValue = 0;
    } else if (numValue > 1) {
      numValue = 1;
    }
    numValue = Math.round(numValue * 100) / 100;
    setQualityInput(numValue.toString());
    setQuality(numValue);
    if (images.length > 0) {
      handleReconversion(numValue);
    }
  };

  const handleSliderChange = (value: number[]) => {
    const newQuality = value[0];
    setQualityInput(newQuality.toString());
  };

  const handleSliderCommit = (value: number[]) => {
    const newQuality = value[0];
    setQuality(newQuality);
    if (images.length > 0) {
      handleReconversion(newQuality);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'kB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const isHeicHeif = (file: File) => 
    file.name.toLowerCase().endsWith('.heic') || 
    file.name.toLowerCase().endsWith('.heif');

  const handleFileSelection = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const allFiles = Array.from(selectedFiles);
    const heicFiles = allFiles.filter(isHeicHeif);
    
    if (heicFiles.length === 0) {
      toast({
        title: "Invalid files",
        description: "Please select HEIC/HEIF images only",
        variant: "destructive",
      });
      return;
    }

    // Clear the input value to ensure the change event fires even with the same files
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    handleFiles(heicFiles);

    const excludedByType = allFiles.length - heicFiles.length;
    if (excludedByType > 0) {
      toast({
        title: "Note",
        description: `${excludedByType} non HEIC/HEIF ${excludedByType === 1 ? 'image was' : 'images were'} ignored`,
      });
    }
  };

  const showDownloadAll = images.length >= 2;
  const downloadAllDisabled = isConverting || !images.every(img => img.convertedBlob);

  const handleDownloadAll = async () => {
    if (isConverting) {
      toast({
        title: "Conversion under process",
        description: "Please wait to Download All..."
      });
      return;
    }

    await downloadAllImages(images);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-center gap-2">
          <ToggleGroup 
            type="single" 
            value={selectionMode} 
            onValueChange={handleModeChange}
            className="flex gap-2"
          >
            <ToggleGroupItem 
              value="image" 
              aria-label="Image Mode" 
              className={cn(
                "flex items-center gap-2 transition-opacity duration-200",
                selectionMode !== 'image' && "opacity-50"
              )}
            >
              <ImageIcon className="w-4 h-4" />
              Image Mode
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="folder" 
              aria-label="Folder Mode" 
              className={cn(
                "flex items-center gap-2 transition-opacity duration-200",
                selectionMode !== 'folder' && "opacity-50"
              )}
            >
              <FolderOpen className="w-4 h-4" />
              Folder Mode
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple
          onChange={(e) => handleFileSelection(e.target.files)}
        />
        <input
          type="file"
          ref={folderInputRef}
          className="hidden"
          onChange={(e) => {
            if (e.target.files) {
              const allFiles = Array.from(e.target.files);
              const heicFiles = allFiles.filter(isHeicHeif);
              const excludedCount = allFiles.length - heicFiles.length;
              
              if (excludedCount > 0) {
                  toast({
                    title: "Note",
                    description: `${excludedCount} non HEIC/HEIF ${excludedCount === 1 ? 'image was' : 'images were'} ignored`,
                  });
              }
              
              handleFiles(heicFiles);
              e.target.value = '';
            }
          }}
        />

        <div className="flex justify-center">
          <Button
            variant="outline"
            className={cn(
              "w-[600px] py-8 text-lg gap-3 relative",
              "border-2 border-dashed",
              isDragging ? "border-primary bg-primary/5" : "border-border",
              "transition-colors duration-200"
            )}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleUploadClick}
            disabled={isConverting}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-3">
                {selectionMode === 'folder' ? (
                  <FolderOpen className="w-6 h-6" />
                ) : (
                  <Upload className="w-6 h-6" />
                )}
                <span>
                  {isDragging 
                    ? "Drop Here" 
                    : selectionMode === 'folder' 
                      ? "Select Album/Folder" 
                      : "Upload or Drop Images"
                  }
                </span>
              </div>
              <span className="text-sm text-muted-foreground opacity-60 transition-opacity duration-200">
                Max {MAX_FILES} images at once
              </span>
            </div>
          </Button>
        </div>

        <div className="space-y-4">
          {format !== 'png' && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">Quality:</label>
                <Input
                  type="text"
                  value={qualityInput}
                  onChange={handleQualityInputChange}
                  onBlur={handleQualityInputBlur}
                  className="w-20 bg-gray-100 dark:bg-gray-800"
                  maxLength={4}
                  disabled={isConverting}
                />
              </div>
              <Slider
                defaultValue={[1]}
                max={1}
                min={0}
                step={0.01}
                value={[parseFloat(qualityInput) || 0]}
                onValueChange={handleSliderChange}
                onValueCommit={handleSliderCommit}
                disabled={isConverting}
                className={cn(
  isConverting && "opacity-50"
)}
              />
            </div>
          )}

          <div className="flex flex-col gap-4">
              <div className={`transition-all duration-500 flex justify-center items-center gap-4 ${
  isFormatSelectOpen ? "mb-32" : "mb-0"
}`}>
                <Select 
                  value={format} 
                  onValueChange={(value: "jpg" | "png" | "webp") => {
                    setFormat(value);
                  }}
                  disabled={isConverting}
                  open={isFormatSelectOpen}
                  onOpenChange={setIsFormatSelectOpen}
                >
                  <SelectTrigger className={cn(
                    "w-[90px] md:w-[120px] focus:ring-0 focus:outline-none",
                    isConverting && "opacity-50 cursor-not-allowed"
                  )}>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
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
                  disabled={isConverting}
                >
                  <RefreshCcw className={cn("w-5 h-5", isConverting && "animate-spin")} />
                  Reset
                </Button>
              )}
            </div>

            {showDownloadAll && (
              <div className="flex justify-center">
                <Button
                  onClick={handleDownloadAll}
                  className={cn(
                    "w-40 gap-2",
                    downloadAllDisabled && "opacity-50"
                  )}
                >
                  <Download className="w-5 h-5" />
                  Download All
                </Button>
              </div>
            )}
          </div>

          {showProgress && (
            <div className="relative p-4 border border-border rounded-lg">
              <Progress value={progress} className="h-6" />
              <span className="absolute inset-0 flex items-center justify-center text-sm">
                Converted {convertedCount}/{totalImages} Image{totalImages > 1 ? 's' : ''}...
              </span>
            </div>
          )}
        </div>

        {images.map((image, index) => (
          <React.Fragment key={image.id}>
            <div className="space-y-4">
              <div 
                className={cn(
                  "border border-border rounded-lg overflow-hidden cursor-pointer",
                  "hover:border-primary transition-colors duration-200",
                  !image.convertedBlob && "opacity-50"
                )}
                onClick={() => image.convertedBlob && openImageInNewTab(image.id)}
                title="Click to open in new tab"
              >
                <img src={image.previewUrl} alt={image.fileName} className="w-full h-auto" />
              </div>
              
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2">
                  {editState.isEditing && editState.imageId === image.id ? (
                    <form 
                      className="flex items-center gap-2"
                      onSubmit={(e) => handleEditSubmit(image.id, e)}
                    >
                      <Input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onBlur={() => handleEditSubmit(image.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            handleEditCancel();
                          }
                        }}
                        className="w-48"
                        autoFocus
                      />
                      <span className="text-muted-foreground">
                        .{format}
                      </span>
                    </form>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-center text-sm text-muted-foreground">
                        {image.fileName}
                      </p>
                      <button
                        onClick={() => handleEditStart(image.id, image.fileName)}
                        className="p-1 hover:bg-secondary rounded-sm transition-colors"
                        title="Rename file"
                        disabled={!image.convertedBlob}
                      >
                        <Pencil className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  )}
                </div>
                {image.convertedBlob && (
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(image.convertedBlob.size)}
                  </p>
                )}
              </div>

              <div className="flex justify-center gap-2">
                <Button 
                  onClick={() => downloadImage(image.id)}
                  className="gap-2"
                  disabled={!image.convertedBlob}
                >
                  <Download className="w-5 h-5" />
                  Download
                </Button>
                <ExifDataDialog 
                  originalFile={image.originalFile}
                  fileName={image.originalFile.name}
                />
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

