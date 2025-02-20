
import React from "react";
import { FileSearch, Layout, Lightbulb } from "lucide-react";

const HomepageContent = () => {
  return (
    <div className="space-y-12 mt-8">
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2 text-foreground">
          <FileSearch className="w-6 h-6 text-primary" />
          How It Works
        </h2>
        <div className="space-y-4 text-muted-foreground">
          <p>
            Simply paste any image from your clipboard using Ctrl+V (Windows) or
            Cmd+V (Mac). Our tool instantly processes the image locally in your
            browser, allowing you to download it immediately.
          </p>
          <p>
            All processing happens right in your browser - your images never leave
            your device, ensuring complete privacy and quick processing times.
          </p>
          <p>
            Supports various image formats including PNG, JPEG, and other common
            web formats, making it perfect for quick image conversions and saves.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2 text-foreground">
          <Layout className="w-6 h-6 text-primary" />
          Common Uses
        </h2>
        <div className="grid gap-4 text-muted-foreground">
          <div>
            <h3 className="font-medium mb-2 text-foreground">Screenshot Sharing</h3>
            <p>
              Quickly save screenshots from your clipboard for sharing in emails,
              documents, or presentations.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2 text-foreground">Document Snippets</h3>
            <p>
              Capture and save important parts of documents, charts, or diagrams
              for reference or documentation.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2 text-foreground">Social Media Content</h3>
            <p>
              Save images from your clipboard for social media posts or content
              creation without the need for image editing software.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2 text-foreground">
          <Lightbulb className="w-6 h-6 text-primary" />
          Tips & Tricks
        </h2>
        <div className="space-y-4 text-muted-foreground">
          <div>
            <h3 className="font-medium mb-2 text-foreground">Keyboard Shortcuts</h3>
            <p>
              Use Ctrl+V (Windows) or Cmd+V (Mac) to quickly paste images. The tool
              automatically detects and processes clipboard content.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2 text-foreground">Format Support</h3>
            <p>
              We support common image formats including PNG and JPEG. Images are
              saved in their original format to maintain quality.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2 text-foreground">Browser Compatibility</h3>
            <p>
              Works best with modern browsers like Chrome, Firefox, Safari, and
              Edge. Keep your browser updated for optimal performance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomepageContent;

