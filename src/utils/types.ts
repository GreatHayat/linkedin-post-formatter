export type TemplateType = "announcement" | "tip" | "story";

export interface Templates {
  [key: string]: string;
}

export type FormatType =
  | "bold"
  | "italic"
  | "underline"
  | "bullet"
  | "numbered"
  | "strikethrough"
  | "emoji"
  | "caseConverter";

export interface UnicodeCharMap {
  [key: string]: string;
}

export interface UnicodeMap {
  bold: UnicodeCharMap;
  italic: UnicodeCharMap;
  underline: UnicodeCharMap;
  strikethrough: UnicodeCharMap;
}
