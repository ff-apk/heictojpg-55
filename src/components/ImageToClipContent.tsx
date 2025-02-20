
import React from "react";
import { FileSearch, Layout, Wrench } from "lucide-react";

const ImageToClipContent = () => {
  return (
    <div className="space-y-12 mt-8">
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2 text-foreground">
          <FileSearch className="w-6 h-6 text-primary" />
          How It Works
        </h2>
        <div className="space-y-4 text-muted-foreground">
          <p>
            Upload images directly from your device or paste an image URL. Our tool
            processes the image and makes it ready for copying to your clipboard
            with a single click.
          </p>
          <p>Note: If you are getting the error "Unable to fetch" when trying to enter an image URL, it means the website has a CORS security mechanism that doesn't allow access to images. In that case, simply open the image in your browser by visiting the image URL, download it, and use the Upload or Drag Image button. Then, click Copy to Clipboard.</p>
          <p>
            Support for both file uploads and URL imports gives you flexibility in
            how you work with images. All processing is done locally for speed and
            privacy.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2 text-foreground">
          <Layout className="w-6 h-6 text-primary" />
          Use Cases
        </h2>
        <div className="grid gap-4 text-muted-foreground">
          <div>
            <h3 className="font-medium mb-2 text-foreground">Social Media Management</h3>
            <p>
              Quickly copy images from your computer or the web for social media
              posts and content creation.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2 text-foreground">Document Preparation</h3>
            <p>
              Copy images directly to your clipboard for pasting into documents,
              presentations, or emails.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2 text-foreground">Web Content Creation</h3>
            <p>
              Streamline your workflow by quickly copying images from files or URLs
              for web content management.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2 text-foreground">
          <Wrench className="w-6 h-6 text-primary" />
          Best Practices
        </h2>
        <div className="space-y-4 text-muted-foreground">
          <div>
            <h3 className="font-medium mb-2 text-foreground">Supported Formats</h3>
            <p>
              We support common web image formats including PNG, JPEG, and GIF.
              Images are converted to PNG when copied to clipboard for maximum
              compatibility.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2 text-foreground">Size Guidelines</h3>
            <p>
              For best performance, use images under 10MB. Larger images may take
              longer to process depending on your device.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2 text-foreground">Browser Support</h3>
            <p>
              Modern browsers (Chrome, Firefox, Safari, Edge) provide the best
              experience. Some features may be limited in older browsers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageToClipContent;

