import { Seo } from "@/components/seo/Seo";
import { AppShell } from "@/components/layout/AppShell";

export default function PrivacyPolicy() {
  return (
    <AppShell>
      <Seo
        title="Privacy Policy | Premium Text-to-Speech Pro"
        description="Privacy Policy for Premium Text-to-Speech Pro. Audio is processed locally and cookies are used for ads and theme settings."
        canonicalPath="/privacy-policy"
      />

      <article className="glass-card rounded-3xl p-6 md:p-8">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Privacy Policy</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </header>

        <div className="prose prose-zinc mt-6 max-w-none dark:prose-invert">
          <p>
            Premium Text-to-Speech Pro is a client-side tool. Your text and generated audio are processed locally on your
            device.
          </p>

          <h2>Local processing</h2>
          <p>
            We do not require an account and we do not upload your scripts for processing. Playback is performed using
            your browser’s built-in speech engine.
          </p>

          <h2>Cookies</h2>
          <p>
            We may use cookies and similar storage technologies for two purposes: (1) to remember your theme preference
            (dark/light mode) and (2) to support advertising (for example, Google AdSense). Ad providers may set cookies
            to personalize or measure ads according to their policies.
          </p>

          <h2>Ads</h2>
          <p>
            This site is optimized for advertising-supported use. Ad containers are clearly labeled as “Sponsored”.
          </p>

          <h2>Contact</h2>
          <p>If you have privacy questions, add a contact email here before publishing.</p>
        </div>
      </article>
    </AppShell>
  );
}
