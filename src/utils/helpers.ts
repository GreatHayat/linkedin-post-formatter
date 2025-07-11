import { UnicodeMapping } from "./constants";
import type { Templates, UnicodeMap } from "./types";

// Sample templates
export const sampleTemplates: Templates = {
  announcement: `# 🚀 Exciting News!

I'm thrilled to announce that **[Your Achievement]**

**Key highlights:**
• Achievement 1
• Achievement 2  
• Achievement 3

*Thank you* to everyone who supported this journey!

#achievement #milestone #grateful`,

  tip: `💡 **Pro Tip:** [Your main tip]

Here's what I've learned:

• **Point 1:** Explanation
• **Point 2:** Explanation  
• **Point 3:** Explanation

*What's your experience with this?* Drop a comment below! 👇

#tips #learning #growth`,

  story: `📖 **Story time:** [Brief hook]

**The challenge:**
[Describe the problem]

**The solution:**
[What you did]

**The result:**
[Impact and outcome]

**Key takeaway:** _[Main lesson learned]_

What challenges are you facing? Let's discuss! 💬

#storytelling #lessons #experience`,
};

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

  // Convert numbered lists
  converted = converted.replace(
    /^[\s]*\d+\.\s+(.*)$/gm,
    (_, p1: string, offset: number, string: string) => {
      const linesBefore = string.substring(0, offset).split("\n").length;
      return `${linesBefore}. ${p1}`;
    }
  );

  // Convert links [text](url) to text (url)
  converted = converted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)");

  // Add some LinkedIn-style separators
  converted = converted.replace(/^---$/gm, "▰▰▰▰▰▰▰▰▰▰");

  return converted;
};
