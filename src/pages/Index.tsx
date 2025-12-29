import { Seo } from "@/components/seo/Seo";
import { AppShell } from "@/components/layout/AppShell";
import { TtsStudio } from "@/components/tts/TtsStudio";
import { GuideFaq } from "@/components/tts/GuideFaq";
import { SeoFooter } from "@/components/seo/SeoFooter";
import { AdSlot } from "@/components/ads/AdSlot";

const Index = () => {
  return (
    <AppShell>
      <Seo
        title="Premium Text-to-Speech Pro | Free TikTok TTS"
        description="Free Text to Speech for TikTok & YouTube creators: natural voices, presets, word highlighting, and MP3 download. Online TTS no registration."
        canonicalPath="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Premium Text-to-Speech Pro",
          applicationCategory: "MultimediaApplication",
          operatingSystem: "Web",
          description:
            "Free online text-to-speech for TikTok and YouTube creators with natural voices, presets, highlighting, and MP3 download.",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
        }}
      />

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Primary Content */}
        <main className="flex-1 min-w-0">
          <TtsStudio />
          
          {/* FAQ Section */}
          <div className="max-w-studio mx-auto mt-16">
            <GuideFaq />
          </div>
        </main>
        
        {/* Sidebar Ad - Non-intrusive */}
        <aside className="hidden xl:block w-[300px] shrink-0">
          <div className="sticky top-8 space-y-6">
            <AdSlot slotId="SIDEBAR_RECTANGLE" label="Sponsored" sizeHint="300x250" />
            
            {/* Quick Tips Card */}
            <div className="glass-card rounded-2xl p-5">
              <h3 className="text-sm font-semibold mb-3">Pro Tips</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-brand mt-0.5">•</span>
                  Use presets for quick mood changes
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand mt-0.5">•</span>
                  Adjust speed for better clarity
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand mt-0.5">•</span>
                  Drop .docx or .txt files directly
                </li>
              </ul>
            </div>
          </div>
        </aside>
      </div>

      {/* Bottom Ad - Horizontal Footer Style */}
      <div className="max-w-studio mx-auto mt-16">
        <AdSlot slotId="BOTTOM_RESPONSIVE" label="Sponsored" className="rounded-xl overflow-hidden" />
      </div>

      <SeoFooter />
    </AppShell>
  );
};

export default Index;