
import React from "react";
import Footer from "@/components/Footer";
import useTheme from "@/hooks/useTheme";
import SEO from "@/components/SEO";
import AdSenseHorizontal from "@/components/AdSenseHorizontal";
import AdSenseResponsive from "@/components/AdSenseResponsive";
import DesktopSidebar from "@/components/DesktopSidebar";

const Feedback = () => {
  useTheme();

  return (
    <>
      <SEO
        title="Feedback - HEIC to JPG Converter"
        description="Share your feedback about our HEIC to JPG converter. Help us improve your HEIC image conversion experience."
        canonicalUrl="https://heictojpgpro.com/feedback"
        robots="max-image-preview:large"
        ogTitle="Feedback - HEIC to JPG Converter"
        ogDescription="Share your feedback about our HEIC to JPG converter. Help us improve your HEIC image conversion experience."
        ogUrl="https://heictojpgpro.com/feedback"
        ogImage="https://heictojpgpro.com/banner.jpg"
        ogType="article"
      />
      <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-8 lg:mr-[300px]">
          <AdSenseHorizontal />
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
              Feedback
            </h1>
          </div>

          <div className="space-y-6">
            <p className="text-lg">
              We value your feedback! Your input helps us improve and provide a better HEIC conversion experience for everyone.
            </p>

            <div>
              <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
              <p>
                For any queries, feedback, suggestions, or bug reports, please email us at:{" "}
                <a
                  href="mailto:info@toolyoulove.com"
                  className="text-primary hover:underline"
                >
                  info@toolyoulove.com
                </a>
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">What We'd Love to Hear About</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>HEIC conversion quality and performance</li>
                <li>Output format preferences (JPG, PNG, WEBP)</li>
                <li>Batch processing experience</li>
                <li>User interface and ease of use</li>
                <li>Browser compatibility issues</li>
                <li>Additional features you'd like to see</li>
                <li>Any bugs or issues you've encountered</li>
              </ul>
            </div>

            <p>
              Thank you for helping us make HEIC to JPG better for everyone!
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

export default Feedback;
