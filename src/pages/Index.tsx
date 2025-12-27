import { Seo } from "@/components/seo/Seo";
import { AppShell } from "@/components/layout/AppShell";
import { TtsStudio } from "@/components/tts/TtsStudio";
import { GuideFaq } from "@/components/tts/GuideFaq";

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

      <TtsStudio />
      <GuideFaq />
    </AppShell>
  );
};

export default Index;
