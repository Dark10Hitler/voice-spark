import { Seo } from "@/components/seo/Seo";
import { AppShell } from "@/components/layout/AppShell";

export default function TermsOfService() {
  return (
    <AppShell>
      <Seo
        title="Terms of Service | Premium Text-to-Speech Pro"
        description="Terms of Service for Premium Text-to-Speech Pro. Use the tool responsibly and comply with platform rules for TikTok/YouTube." 
        canonicalPath="/terms-of-service"
      />

      <article className="glass-card rounded-3xl p-6 md:p-8">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Terms of Service</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </header>

        <div className="prose prose-zinc mt-6 max-w-none dark:prose-invert">
          <p>
            By using Premium Text-to-Speech Pro, you agree to use the tool in compliance with applicable laws and the
            rules of the platforms where you publish (TikTok, YouTube, Instagram, etc.).
          </p>

          <h2>No warranties</h2>
          <p>
            The tool is provided “as is”. Availability and audio quality may vary depending on your browser and device.
          </p>

          <h2>Your content</h2>
          <p>
            You are responsible for the scripts you paste into the editor and the audio you generate. Do not use the
            tool to create harmful, misleading, or illegal content.
          </p>

          <h2>Advertising</h2>
          <p>This site may display ads. Ads are labeled as “Sponsored”.</p>

          <h2>Changes</h2>
          <p>We may update these terms over time. Continued use means acceptance of the updated terms.</p>
        </div>
      </article>
    </AppShell>
  );
}
