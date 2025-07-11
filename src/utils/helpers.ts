import { UnicodeMapping } from "./constants";
import type { UnicodeMap } from "./types";

// Convert text to Unicode formatting
export const convertToUnicode = (
  text: string,
  style: keyof UnicodeMap
): string => {
  // Unicode characters for LinkedIn formatting
  const unicodeMap: UnicodeMap = UnicodeMapping;

  return text
    .split("")
    .map((char) => unicodeMap[style][char] || char)
    .join("");
};

export const convertToUnicodeUnderline = (text: string): string => {
  const COMBINING_UNDERLINE = "\u0332";

  return text
    .split("")
    .map((char) => char + COMBINING_UNDERLINE)
    .join("");
};

// Convert text to monospace Unicode
const convertToCode = (text: string): string => {
  const unicodeMap: UnicodeMap = UnicodeMapping;
  return text
    .split("")
    .map((char) => unicodeMap["code"][char] || char)
    .join("");
};

// Convert markdown to LinkedIn format
export const convertMarkdownToLinkedIn = (text: string): string => {
  let converted = text;

  // Convert headers to bold
  converted = converted.replace(/^### (.*$)/gm, (_, p1: string) =>
    convertToUnicode(p1, "bold")
  );
  converted = converted.replace(/^## (.*$)/gm, (_, p1: string) =>
    convertToUnicode(p1, "bold")
  );
  converted = converted.replace(/^# (.*$)/gm, (_, p1: string) =>
    convertToUnicode(p1, "bold")
  );

  // Handle combinations first (order matters!)
  // Bold + Italic + Strikethrough: ***~~text~~***
  converted = converted.replace(/\*\*\*~~(.*?)~~\*\*\*/g, (_, p1: string) => {
    let result = convertToUnicode(p1, "bold");
    result = convertToUnicode(result, "italic");
    return convertToUnicode(result, "strikethrough");
  });

  // Bold + Italic: ***text***
  converted = converted.replace(/\*\*\*(.*?)\*\*\*/g, (_, p1: string) => {
    const result = convertToUnicode(p1, "bold");
    return convertToUnicode(result, "italic");
  });

  // Bold + Italic: **_text_**
  converted = converted.replace(/\*\*_(.*?)_\*\*/g, (_, p1: string) => {
    const result = convertToUnicode(p1, "bold");
    return convertToUnicode(result, "italic");
  });

  // Bold + Italic: *__text__*
  converted = converted.replace(/\*__(.*?)__\*/g, (_, p1: string) => {
    const result = convertToUnicode(p1, "bold");
    return convertToUnicode(result, "italic");
  });

  // Bold + Strikethrough: **~~text~~**
  converted = converted.replace(/\*\*~~(.*?)~~\*\*/g, (_, p1: string) => {
    const result = convertToUnicode(p1, "bold");
    return convertToUnicode(result, "strikethrough");
  });

  // Italic + Strikethrough: *~~text~~*
  converted = converted.replace(/\*~~(.*?)~~\*/g, (_, p1: string) => {
    const result = convertToUnicode(p1, "italic");
    return convertToUnicode(result, "strikethrough");
  });

  // Process strikethrough BEFORE underline to avoid conflicts
  // Convert strikethrough markdown ~~text~~ to Unicode strikethrough
  converted = converted.replace(/~~(.*?)~~/g, (_, p1: string) =>
    convertToUnicode(p1, "strikethrough")
  );

  // Single formatting
  // Convert bold markdown **text** to Unicode bold
  converted = converted.replace(/\*\*(.*?)\*\*/g, (_, p1: string) =>
    convertToUnicode(p1, "bold")
  );

  // Convert italic markdown *text* to Unicode italic
  converted = converted.replace(/\*(.*?)\*/g, (_, p1: string) =>
    convertToUnicode(p1, "italic")
  );

  // Convert underline markdown _text_ to Unicode underline (process LAST)
  // Use a more specific pattern to avoid conflicts
  converted = converted.replace(
    /(?<!\w)_((?:[^_]|__)+?)_(?!\w)/g,
    (_, p1: string) => convertToUnicodeUnderline(p1)
  );

  // Convert bullet points
  converted = converted.replace(/^[\s]*[-*+]\s+(.*)$/gm, "• $1");

  // Convert numbered lists with better spacing preservation
  const numberedListRegex = /^[\s]*\d+\.\s+(.*)$/gm;
  const lines = converted.split("\n");
  let inNumberedList = false;
  let listNumber = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(numberedListRegex);

    if (match) {
      // This is a numbered list item
      if (!inNumberedList) {
        // Starting a new list
        listNumber = 1;
        inNumberedList = true;
      }

      // Replace with correct numbering
      lines[i] = line.replace(/^[\s]*\d+\./, `${listNumber}.`);
      listNumber++;
    } else if (line.trim() === "") {
      // Empty line - keep as is, don't change list state
      continue;
    } else {
      // Non-empty, non-numbered line - end the current list
      inNumberedList = false;
      listNumber = 1;
    }
  }

  converted = lines.join("\n");

  // Convert quote blocks
  // converted = converted.replace(/^> (.*)$/gm, (_, p1: string) => {
  //   // Using decorative quote characters for LinkedIn
  //   return `❝ ${p1} ❞`;
  // });

  // Multi-line quotes (optional - for block quotes)
  converted = converted.replace(/^> (.*(?:\n> .*)*)$/gm, (_, p1: string) => {
    const lines = p1.split("\n").map((line) => line.replace(/^> /, ""));
    return `❝ ${lines.join("\n")} ❞`;
  });

  // Convert inline code
  converted = converted.replace(/`([^`]+)`/g, (_, p1: string) => {
    return `⟨${convertToCode(p1)}⟩`;
  });

  // Convert links [text](url) to text (url)
  converted = converted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)");

  // Add some LinkedIn-style separators
  converted = converted.replace(/^---$/gm, "▰▰▰▰▰▰▰▰▰▰");

  return converted;
};
