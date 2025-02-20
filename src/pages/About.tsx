
import React from "react";
import Footer from "@/components/Footer";
import useTheme from "@/hooks/useTheme";
import SEO from "@/components/SEO";
import AdSenseHorizontal from "@/components/AdSenseHorizontal";
import AdSenseResponsive from "@/components/AdSenseResponsive";
import DesktopSidebar from "@/components/DesktopSidebar";
import { Shield, FileImage, Zap, Settings, Globe } from "lucide-react";

const About = () => {
  useTheme();
  
  return (
    <>
      <SEO
        title="About HEIC to JPG - Free HEIC Image Converter"
        description="Learn about our free HEIC to JPG converter. Convert HEIC images from iPhone and iOS devices to JPG, PNG, or WEBP format with our secure, local conversion tool."
        canonicalUrl="https://heictojpgpro.com/about"
        robots="max-image-preview:large"
        ogTitle="About HEIC to JPG - Free HEIC Image Converter"
        ogDescription="Learn about our free HEIC to JPG converter. Convert HEIC images from iPhone and iOS devices to JPG, PNG, or WEBP format with our secure, local conversion tool."
        ogUrl="https://heictojpgpro.com/about"
        ogImage="https://heictojpgpro.com/banner.jpg"
        ogType="article"
      />
      <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-8 lg:mr-[300px]">
          <AdSenseHorizontal />
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
              About HEIC to JPG Converter
            </h1>
          </div>

          <div className="space-y-6">
            <p className="text-lg">
              Welcome to HEIC to JPG, a powerful and secure tool designed to help you convert HEIC images from your iPhone and iOS devices into widely compatible formats like JPG, PNG, and WEBP.
            </p>

            <div>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-6 h-6 text-primary" />
                Key Features
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Convert multiple HEIC images simultaneously</li>
                <li>Support for JPG, PNG, and WEBP output formats</li>
                <li>Adjustable quality settings for optimal results</li>
                <li>Drag-and-drop interface for easy use</li>
                <li>Preview images before conversion</li>
                <li>Free to use with no daily or monthly limit.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                Privacy & Security
              </h2>
              <p className="mb-4">
                Your privacy is our top priority. All image conversions happen locally in your browser - your images never leave your device or get uploaded to any server. This ensures complete privacy and security while processing your personal photos and images.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-6 h-6 text-primary" />
                Performance
              </h2>
              <p className="mb-4">
                Our converter processes images quickly and efficiently right in your browser. With support for batch processing, you can convert multiple HEIC images at once while maintaining high quality output. The local processing approach also means faster conversion times with no waiting for uploads or downloads.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Globe className="w-6 h-6 text-primary" />
                Browser Support
              </h2>
              <p className="mb-4">
                Our tool works seamlessly across all modern browsers including Chrome, Firefox, Safari, and Edge. For the best experience, we recommend using the latest version of your preferred browser.
              </p>
            </div>

            <p>
              Start using HEIC to JPG today - it's free, secure, and designed to make your image conversion process as smooth as possible!
            </p>
          </div>
          <AdSenseResponsive />
          <Footer />
        </div>
        <DesktopSidebar />
      </div>
    </>
  );
};

export default About;
