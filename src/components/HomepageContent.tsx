
import React from "react";
import { Shield, FileImage, Layout, Zap, Settings } from "lucide-react";

const HomepageContent = () => {
  return (
    <div className="space-y-12 mt-8">
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2 text-foreground">
          <FileImage className="w-6 h-6 text-primary" />
          How It Works
        </h2>
        <div className="space-y-4 text-muted-foreground">
          <p>
            Simply drag and drop your HEIC images or select them from your device. Our tool instantly converts them to your chosen format (JPG, PNG, or WEBP) right in your browser - no uploads needed!
          </p>
          <p>
            All processing happens locally on your device, ensuring your photos remain private and secure. Perfect for converting iPhone and iOS photos to widely compatible formats.
          </p>
          <p>
            Convert multiple images at once with our batch processing feature, and download them individually or all at once when ready.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2 text-foreground">
          <Settings className="w-6 h-6 text-primary" />
          Key Features
        </h2>
        <div className="grid gap-4 text-muted-foreground">
          <div>
            <h3 className="font-medium mb-2 text-foreground">Multiple Format Support</h3>
            <p>
              Convert your HEIC images to JPG, PNG, or WEBP format with adjustable quality settings for perfect results.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2 text-foreground">Batch Processing</h3>
            <p>
              Convert multiple HEIC images simultaneously with our efficient batch processing system.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2 text-foreground">Quality Control</h3>
            <p>
              Fine-tune your conversion with adjustable quality settings to balance file size and image quality.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2 text-foreground">
          <Shield className="w-6 h-6 text-primary" />
          Privacy & Security
        </h2>
        <div className="space-y-4 text-muted-foreground">
          <div>
            <h3 className="font-medium mb-2 text-foreground">100% Local Processing</h3>
            <p>
              Your images never leave your device - all conversions happen right in your browser for complete privacy and security.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2 text-foreground">No Upload Required</h3>
            <p>
              Unlike other converters, we don't need to upload your images to a server. This means faster conversions and guaranteed privacy.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2 text-foreground">
          <Zap className="w-6 h-6 text-primary" />
          Performance
        </h2>
        <div className="space-y-4 text-muted-foreground">
          <div>
            <h3 className="font-medium mb-2 text-foreground">Fast Conversion</h3>
            <p>
              Experience quick conversion times with our optimized local processing engine.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2 text-foreground">No File Limits</h3>
            <p>
              Convert as many HEIC images as you need - there's no artificial limit on file numbers or sizes.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2 text-foreground">Browser Compatibility</h3>
            <p>
              Works seamlessly across all modern browsers including Chrome, Firefox, Safari, and Edge.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomepageContent;
