
import React from "react";
import Footer from "@/components/Footer";
import useTheme from "@/hooks/useTheme";
import SEO from "@/components/SEO";
import AdSenseHorizontal from "@/components/AdSenseHorizontal";
import AdSenseResponsive from "@/components/AdSenseResponsive";
import DesktopSidebar from "@/components/DesktopSidebar";
import { Sparkles, Shield, Globe } from "lucide-react";

const About = () => {
  useTheme();
  
  return (
    <>
      <SEO
        title="About Clipboard to Image - Easy Image Conversion Tool"
        description="Learn about our free Clipboard to Image converter tool. Convert clipboard content to downloadable images instantly with our user-friendly tool."
        canonicalUrl="https://clipboard-to-image.toolyoulove.com/about"
        robots="max-image-preview:large"
        ogTitle="About Clipboard to Image - Easy Image Conversion Tool"
        ogDescription="Learn about our free Clipboard to Image converter tool. Convert clipboard content to downloadable images instantly with our user-friendly tool."
        ogUrl="https://clipboard-to-image.toolyoulove.com/about"
        ogImage="https://clipboard-to-image.toolyoulove.com/banner.jpg"
        ogType="article"
      />
      <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-8 lg:mr-[300px]">
          <AdSenseHorizontal />
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
              About Clipboard to Image
            </h1>
          </div>

          <div className="space-y-6">
            <p className="text-lg">
              Welcome to Clipboard to Image, a simple yet powerful tool designed to help you convert clipboard content into downloadable images instantly.
            </p>

            <div>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                Key Features
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Quick clipboard-to-image conversion with just one paste</li>
                <li>Keyboard shortcut support (Ctrl+V / Cmd+V)</li>
                <li>Dark and light mode for comfortable viewing</li>
                <li>Local processing - your images never leave your browser</li>
                <li>Cross-browser compatibility</li>
                <li>Instant image downloads in PNG format</li>
                <li>No registration required</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                Privacy & Security
              </h2>
              <p className="mb-4">
                Your privacy is our priority. All image processing happens locally in your browser - we never store or transmit your images to any server. This ensures your content remains completely private and secure.
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
              Start using Clipboard to Image today - it's free, fast, and focused on providing the best image conversion experience possible!
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
