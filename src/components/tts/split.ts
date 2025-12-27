export type TextChunk = { text: string; start: number; end: number };

export function chunkText(text: string, maxChars = 220): TextChunk[] {
  const t = text.replace(/\r\n/g, "\n");
  const chunks: TextChunk[] = [];

  let i = 0;
  while (i < t.length) {
    // Skip leading whitespace
    while (i < t.length && /\s/.test(t[i])) i++;
    if (i >= t.length) break;

    let start = i;
    let end = Math.min(t.length, start + maxChars);

    // Prefer sentence end within window
    const window = t.slice(start, end);
    const lastPunct = Math.max(window.lastIndexOf("."), window.lastIndexOf("!"), window.lastIndexOf("?"), window.lastIndexOf("\n"));

    if (lastPunct > 40) {
      end = start + lastPunct + 1;
    } else {
      // Otherwise, split at last whitespace
      const lastSpace = window.lastIndexOf(" ");
      if (lastSpace > 40) end = start + lastSpace;
    }

    const chunk = t.slice(start, end).trim();
    if (chunk) chunks.push({ text: chunk, start, end });
    i = end;
  }

  return chunks;
}
