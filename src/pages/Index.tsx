
import React from "react";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import AdSenseHorizontal from "@/components/AdSenseHorizontal";
import AdSenseResponsive from "@/components/AdSenseResponsive";
import DesktopSidebar from "@/components/DesktopSidebar";
import HeicConverter from "@/components/HeicConverter";
import HomepageContent from "@/components/HomepageContent";

const Index = () => {
  return (
    <>
      <SEO
        title="HEIC to JPG - Convert HEIC Images to JPG Online"
        description="Convert HEIC images to JPG, PNG, or WEBP format online. View and process multiple images at once with our free converter."
        canonicalUrl="https://clipboard-to-image.toolyoulove.com/"
        robots="max-image-preview:large"
        ogTitle="HEIC to JPG - Convert HEIC Images to JPG Online"
        ogDescription="Convert HEIC images to JPG, PNG, or WEBP format online. View and process multiple images at once with our free converter."
        ogUrl="https://clipboard-to-image.toolyoulove.com/"
        ogImage="https://clipboard-to-image.toolyoulove.com/banner.jpg"
        ogType="website"
      />
      <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-8 lg:mr-[300px]">
          <AdSenseHorizontal />
          <Header />
          <div className="border border-border bg-card dark:bg-card rounded-xl p-6">
            <HeicConverter />
          </div>
          <AdSenseResponsive />
          <HomepageContent />
          <Footer />
        </div>
        <DesktopSidebar />
      </div>
    </>
  );
};

export default Index;
