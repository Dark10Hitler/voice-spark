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

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        <div className="space-y-8">
          <TtsStudio />
          <GuideFaq />
        </div>
        
        {/* Sidebar with Ad */}
        <aside className="hidden lg:block space-y-6">
          <div className="sticky top-6">
            <AdSlot slotId="SIDEBAR_RECTANGLE" label="Sponsored" sizeHint="300x250" />
          </div>
        </aside>
      </div>

      <SeoFooter />
    </AppShell>
  );
};

export default Index;
