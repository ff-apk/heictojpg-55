
import React from "react";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const Privacy = () => {
  return (
    <>
      <SEO
        title="Privacy Policy - HEIC to JPG"
        description="Privacy policy for HEIC to JPG converter - how we handle your data and protect your privacy"
        canonicalUrl="https://heictojpgpro.com/privacy"
        robots="noindex"
      />
      <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="prose dark:prose-invert max-w-none space-y-6">
            <h1 className="text-3xl font-bold text-center mb-8">Privacy Policy</h1>
            
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Introduction</h2>
              <p>
                At HEIC to JPG, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your information when you use our service.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Information We Don't Collect</h2>
              <p>
                Our service operates entirely in your browser. We do not:
              </p>
              <ul className="list-disc pl-6">
                <li>Store any of your images</li>
                <li>Upload your images to any server</li>
                <li>Track individual user behavior</li>
                <li>Collect personal information</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">How It Works</h2>
              <p>
                When you use our service to convert HEIC images:
              </p>
              <ul className="list-disc pl-6">
                <li>All conversion happens locally in your browser</li>
                <li>Your images never leave your device</li>
                <li>No data is stored on our servers</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Analytics</h2>
              <p>
                We use anonymous analytics to understand how our service is used. This includes:
              </p>
              <ul className="list-disc pl-6">
                <li>Basic visit statistics</li>
                <li>Anonymous usage patterns</li>
                <li>Performance metrics</li>
              </ul>
              <p>
                This data is aggregated and cannot be used to identify individual users.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Contact</h2>
              <p>
                If you have any questions about our privacy policy, please contact us through our feedback form.
              </p>
            </section>

          </div>
          <Footer />
        </div>
      </div>
    </>
  );
};

export default Privacy;
