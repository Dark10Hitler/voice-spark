import { motion } from "framer-motion";

export function GuideFaq() {
  return (
    <section aria-label="Guide and FAQ" className="mt-8">
      <motion.article
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="glass-card rounded-3xl p-6 md:p-8"
      >
        <header>
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            <span className="text-gradient">Guide & FAQ: Free Text to Speech for TikTok</span>
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Learn how to turn scripts into high-retention voiceovers with a voice generator with download — optimized for
            TikTok, YouTube Shorts, and Instagram Reels.
          </p>
        </header>

        <div className="prose prose-zinc mt-6 max-w-none dark:prose-invert">
          <h3>What is Premium Text-to-Speech Pro?</h3>
          <p>
            Premium Text-to-Speech Pro is an <strong>online TTS no registration</strong> tool built for creators who want
            fast, clean, repeatable voiceovers. You paste a script, choose a voice, apply a mood preset, and export.
            Everything runs inside your browser, which keeps your workflow lightweight and privacy-friendly.
          </p>
          <p>
            If you’re searching for <strong>Natural AI voices free</strong> or a “free text to speech for TikTok” studio,
            this app is designed to feel like a premium SaaS product (Apple/Linear vibe) while staying instant to use.
            The UI is purposely uncluttered: one main workspace, a clean sidebar for ads/notes, and clearly separated
            controls.
          </p>

          <h3>How do I get the best “natural” voice?</h3>
          <p>
            Your device provides multiple system voices. We automatically listen for changes in the voice list and then
            rank voices that include keywords like <em>Google</em> or <em>Natural</em>. These voices often sound cleaner
            for short-form content. If you don’t want to choose manually, leave voice selection on “Auto (best match)”.
          </p>
          <p>
            Pro tip: keep your script conversational and add punctuation. The speech engine uses punctuation for timing.
            For example, commas add micro-pauses, while periods create a stronger cadence that can increase retention.
          </p>

          <h3>Does this tool detect language automatically?</h3>
          <p>
            Yes. We run a quick on-device language heuristic and pick a matching voice when possible. This is useful for
            bilingual creators, multi-language channels, and global content strategies. It also helps when you paste
            captions in Russian, Spanish, Japanese, or mixed scripts.
          </p>

          <h3>How do the presets work (Horror / Advertisement / Meditation)?</h3>
          <p>
            Presets are “one-tap moods” that tune pitch, rate, and effects. They are built for mass-market creator
            workflows: you can instantly test variations, then export the best-performing voiceover.
          </p>
          <ul>
            <li>
              <strong>Horror</strong>: low pitch + slower rate + echo to create tension.
            </li>
            <li>
              <strong>Advertisement</strong>: higher pitch + faster delivery + “crystal clear” boost for punchy hooks.
            </li>
            <li>
              <strong>Meditation</strong>: gentle pitch/rate + softer volume for calm narration.
            </li>
          </ul>

          <h3>What are the audio effects (Radio / Echo / Crystal Clear)?</h3>
          <p>
            Effects are applied to the <em>exported</em> audio and the post-export preview. Radio uses a high-pass filter
            and subtle distortion for a phone/AM vibe. Echo uses a delay with feedback. Crystal Clear adds a light
            compressor and a high-shelf “clarity” lift.
          </p>

          <h3>How does MP3 download work?</h3>
          <p>
            A pure browser TTS engine doesn’t expose a direct audio stream that can be wired into the Web Audio graph in
            every browser. For maximum compatibility, we use a local capture approach and then encode to MP3 using a
            lightweight encoder. This keeps the promise of a <strong>voice generator with download</strong> without
            external APIs.
          </p>
          <p>
            During export you’ll see “Processing & downloading…” with progress and a Cancel button. When encoding
            finishes, we trigger an automatic download and also show an audio preview.
          </p>

          <h3>Why does the app split long text?</h3>
          <p>
            Browsers can time out or become unstable when asked to read extremely long blocks in a single utterance. We
            automatically split text into sentence-like chunks and queue them. This improves reliability for narrations,
            lists, and long YouTube scripts.
          </p>

          <h3>Can I upload .txt or .docx scripts?</h3>
          <p>
            Yes. Drag and drop a <strong>.txt</strong> file or a <strong>.docx</strong> (Word) document. We extract the
            raw text from .docx locally, then paste it into the editor so you can tweak pacing and emphasis.
          </p>

          <h3>How do I use this tool for YouTube Shorts?</h3>
          <p>
            YouTube Shorts voiceovers should be crisp and immediate. Start with a 1–2 sentence hook, test the
            Advertisement preset, then slightly reduce the rate if it feels rushed. Use short lines and punctuation.
            Export, listen to the preview, and only then place it under your video.
          </p>

          <h3>How do I use this tool for Instagram Reels?</h3>
          <p>
            Reels often benefit from a softer cadence. Try Meditation for explanatory content, or Advertisement for fast
            “tips” style videos. Keep the script under 120–160 words for most Reels and let the voice breathe with commas.
          </p>

          <h3>5 more detailed Shorts & Reels questions</h3>
          <h4>1) What’s the ideal script length for Shorts and Reels?</h4>
          <p>
            For most creators, 45–70 seconds is a sweet spot for retention. That’s roughly 110–170 words depending on the
            rate. Keep it tighter for trending formats where viewers swipe quickly.
          </p>
          <h4>2) How do I make a voiceover match fast cuts?</h4>
          <p>
            Write in short “beats” (one idea per line). Use punctuation intentionally. If you need faster cuts, increase
            rate slightly (1.1–1.2) and reduce echo. Re-export and compare.
          </p>
          <h4>3) Should I export one long voiceover or several segments?</h4>
          <p>
            For Shorts/Reels, exporting segments can give you better editing control. Create separate paragraphs for each
            scene, export, and align each segment to your cut points.
          </p>
          <h4>4) How do I make the voice sound more “premium”?</h4>
          <p>
            Choose the best “natural” system voice, keep volume high, and avoid overusing effects. Use Crystal Clear for
            ads or product scripts, and avoid distortion unless it’s a stylistic choice.
          </p>
          <h4>5) How do I prevent robotic pacing?</h4>
          <p>
            Add pauses with commas, use shorter sentences, and vary sentence length. Read your script out loud once: if
            it sounds natural when you read it, it tends to sound natural in TTS too.
          </p>

          <h3>Keywords (for search intent)</h3>
          <p>
            If you landed here from Google: this is a <strong>Free Text to Speech for TikTok</strong> workflow, an
            <strong>online TTS no registration</strong> studio, and a <strong>voice generator with download</strong> with
            a premium UI.
          </p>
        </div>
      </motion.article>
    </section>
  );
}
