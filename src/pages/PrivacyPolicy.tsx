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
            your browser's built-in speech engine.
          </p>

          <h2>Cookies</h2>
          <p>
            We may use cookies and similar storage technologies for two purposes: (1) to remember your theme preference
            (dark/light mode) and (2) to support advertising (for example, Google AdSense). Ad providers may set cookies
            to personalize or measure ads according to their policies.
          </p>

          <h2>Google AdSense and Personalized Ads (EEA/UK Users)</h2>
          <p>
            We use Google AdSense to display advertisements on this website. Google, as a third-party vendor, uses cookies 
            to serve ads based on your prior visits to this website or other websites. For users in the European Economic 
            Area (EEA) and the United Kingdom (UK), we obtain your consent before serving personalized ads.
          </p>
          <p>
            Google uses advertising cookies to enable it and its partners to serve ads based on your browsing behavior. 
            You may opt out of personalized advertising by visiting{" "}
            <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Google Ads Settings
            </a>
            . Alternatively, you may opt out of third-party vendor cookies by visiting{" "}
            <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              www.aboutads.info
            </a>
            .
          </p>
          <p>
            You can change your cookie consent preferences at any time by clicking the "Cookie Settings" link in the footer 
            of this website. This allows you to withdraw or modify your consent for personalized advertising.
          </p>

          <h2>Ads</h2>
          <p>
            This site is optimized for advertising-supported use. Ad containers are clearly labeled as "Sponsored" or "Advertisement".
          </p>

          <h2>Contact</h2>
          <p>If you have privacy questions, add a contact email here before publishing.</p>
        </div>
      </article>
    </AppShell>
  );
}
