import React, { useState, useRef, type ChangeEvent, useEffect } from "react";
import {
  Copy,
  Check,
  Bold,
  Italic,
  Underline,
  List,
  RotateCcw,
  Sparkles,
  Undo,
  Redo,
  Send,
  Hash,
  Minus,
  Smile,
  Quote,
  Code,
} from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import { sampleTemplates } from "../utils/templates";
import { convertMarkdownToLinkedIn } from "../utils/helpers";
import type { TemplateType, FormatType } from "../utils/types";

const LinkedInTextFormatter: React.FC = () => {
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [inputText, setInputText] = useState<string>("");
  const [outputText, setOutputText] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [history, setHistory] = useState<string[]>([""]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        if (event.key === "z" && !event.shiftKey) {
          event.preventDefault();
          undo();
        } else if (event.key === "y" || (event.key === "z" && event.shiftKey)) {
          event.preventDefault();
          redo();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [historyIndex, history]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Handle emoji picker
      if (
        showEmojiPicker &&
        emojiPickerRef.current &&
        event.target instanceof Node
      ) {
        if (!emojiPickerRef.current.contains(event.target)) {
          setShowEmojiPicker(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEmojiPicker]);

  // Render text with hashtag highlighting
  const renderTextWithHashtags = (text: string) => {
    const parts = text.split(/(\s+)/);
    return parts.map((part, index) => {
      if (part.startsWith("#") && part.length > 1) {
        return (
          <span
            key={index}
            className="text-blue-600 hover:underline cursor-pointer"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  // Handle text input and auto-convert
  const handleInputChange = (text: string): void => {
    setInputText(text);
    // Always convert markdown to LinkedIn format for output
    setOutputText(convertMarkdownToLinkedIn(text));

    // Update history for undo/redo
    if (text !== history[historyIndex]) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(text);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  // Rich text editor functions
  const insertFormatting = (format: FormatType): void => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = inputText.substring(start, end);
    let newText = inputText;
    let formattedText = "";

    switch (format) {
      case "bold":
        formattedText = selectedText ? `**${selectedText}**` : "**Bold Text**";
        break;
      case "italic":
        formattedText = selectedText ? `*${selectedText}*` : "*Italic Text*";
        break;
      case "underline":
        formattedText = selectedText
          ? `_${selectedText}_`
          : "_Underlined Text_";
        break;
      case "bullet":
        if (selectedText) {
          const lines = selectedText.split("\n");
          formattedText = lines
            .map((line) => (line.trim() ? `• ${line.trim()}` : line))
            .join("\n");
        } else {
          formattedText = "• Bullet point";
        }
        break;

      case "numbered":
        if (selectedText) {
          const lines = selectedText.split("\n").filter((line) => line.trim());
          formattedText = lines
            .map((line, index) => `${index + 1}. ${line.trim()}`)
            .join("\n");
        } else {
          formattedText = "1. Numbered item";
        }
        break;

      case "strikethrough":
        formattedText = selectedText
          ? `~~${selectedText}~~`
          : "~~Strikethrough Text~~";
        break;

      case "emoji":
        setShowEmojiPicker(!showEmojiPicker);
        break;

      case "quote":
        if (selectedText) {
          const lines = selectedText.split("\n");
          formattedText = lines
            .map((line) => (line.trim() ? `> ${line.trim()}` : line))
            .join("\n");
        } else {
          formattedText = "> Quote text";
        }
        break;

      case "code":
        if (selectedText) {
          // For multi-line code blocks
          if (selectedText.includes("\n")) {
            formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
          } else {
            // For inline code
            formattedText = `\`${selectedText}\``;
          }
        } else {
          formattedText = "`code`";
        }
        break;

      default:
        formattedText = selectedText;
    }

    newText =
      inputText.substring(0, start) + formattedText + inputText.substring(end);
    handleInputChange(newText);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + formattedText.length,
        start + formattedText.length
      );
    }, 0);
  };

  // Undo function
  const undo = (): void => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const previousText = history[newIndex];
      setInputText(previousText);
      setOutputText(convertMarkdownToLinkedIn(previousText));
    }
  };

  // Redo function
  const redo = (): void => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const nextText = history[newIndex];
      setInputText(nextText);
      setOutputText(convertMarkdownToLinkedIn(nextText));
    }
  };

  // Copy to clipboard
  const copyToClipboard = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  // Clear all text
  const clearText = (): void => {
    setInputText("");
    setOutputText("");
    setHistory([""]);
    setHistoryIndex(0);
  };

  // Handle textarea change event
  const handleTextareaChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    handleInputChange(e.target.value);
  };

  const insertEmoji = (emoji: string): void => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText =
      inputText.substring(0, start) + emoji + inputText.substring(end);

    handleInputChange(newText);
    setShowEmojiPicker(false); // This ensures it closes after selection

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
  };

  const loadTemplate = (template: TemplateType): void => {
    const templateText = sampleTemplates[template];
    setInputText(templateText);
    setOutputText(convertMarkdownToLinkedIn(templateText));

    // Update history
    setHistory([templateText]);
    setHistoryIndex(0);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center space-x-2 bg-blue-100 px-3 sm:px-4 py-2 rounded-full mb-4">
            <Sparkles size={20} className="text-blue-600" />
            <span className="text-blue-700 font-medium text-sm sm:text-base">
              LinkedIn Post Formatter
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Create Stunning LinkedIn Posts
          </h1>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto px-4">
            Transform plain text into powerful, formatted LinkedIn content that
            stands out and drives engagement
          </p>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Left Side - Editor */}
          <div className="space-y-4 sm:space-y-6 order-1">
            {/* Editor Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              {/* Mode Switcher & Header */}
              <div className="border-b border-gray-200 p-3 sm:p-4">
                {/* Toolbar */}
                <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide">
                  <button
                    onClick={() => insertFormatting("bold")}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 flex-shrink-0"
                    title="Bold (Ctrl+B)"
                  >
                    <Bold size={18} className="text-gray-700" />
                  </button>
                  <button
                    onClick={() => insertFormatting("italic")}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 flex-shrink-0"
                    title="Italic (Ctrl+I)"
                  >
                    <Italic size={18} className="text-gray-700" />
                  </button>
                  <button
                    onClick={() => insertFormatting("underline")}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 flex-shrink-0"
                    title="Underline (Ctrl+U)"
                  >
                    <Underline size={18} className="text-gray-700" />
                  </button>

                  <button
                    onClick={() => insertFormatting("strikethrough")}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 flex-shrink-0"
                    title="Strikethrough"
                  >
                    <Minus size={18} className="text-gray-700" />
                  </button>

                  <div className="w-px h-6 bg-gray-300 mx-2 flex-shrink-0"></div>
                  <div className="relative flex-shrink-0" ref={emojiPickerRef}>
                    <button
                      onClick={() => insertFormatting("emoji")}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                      title="Add Emoji"
                    >
                      <Smile size={18} className="text-gray-700" />
                    </button>

                    {/* Emoji Picker */}
                    {showEmojiPicker && (
                      <div className="absolute top-12 left-0 z-10">
                        <EmojiPicker
                          onEmojiClick={(emojiData) =>
                            insertEmoji(emojiData.emoji)
                          }
                          width={Math.min(350, window.innerWidth - 40)}
                          height={400}
                          previewConfig={{ showPreview: false }}
                          skinTonesDisabled
                        />
                      </div>
                    )}
                  </div>

                  <div className="w-px h-6 bg-gray-300 mx-2 flex-shrink-0"></div>

                  <button
                    onClick={() => insertFormatting("bullet")}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 flex-shrink-0"
                    title="Bullet List"
                  >
                    <List size={18} className="text-gray-700" />
                  </button>
                  <button
                    onClick={() => insertFormatting("numbered")}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 flex-shrink-0"
                    title="Numbered List"
                  >
                    <Hash size={18} className="text-gray-700" />
                  </button>

                  <div className="w-px h-6 bg-gray-300 mx-2 flex-shrink-0"></div>

                  <button
                    onClick={() => insertFormatting("quote")}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 flex-shrink-0"
                    title="Quote Block"
                  >
                    <Quote size={18} className="text-gray-700" />
                  </button>

                  <button
                    onClick={() => insertFormatting("code")}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 flex-shrink-0"
                    title="Code Block"
                  >
                    <Code size={18} className="text-gray-700" />
                  </button>

                  <div className="w-px h-6 bg-gray-300 mx-2 flex-shrink-0"></div>

                  <button
                    onClick={undo}
                    disabled={historyIndex <= 0}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                    title="Undo (Ctrl+Z)"
                  >
                    <Undo size={18} className="text-gray-700" />
                  </button>
                  <button
                    onClick={redo}
                    disabled={historyIndex >= history.length - 1}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                    title="Redo (Ctrl+Y)"
                  >
                    <Redo size={18} className="text-gray-700" />
                  </button>
                  <button
                    onClick={clearText}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                    title="Clear All"
                  >
                    <RotateCcw size={18} className="text-gray-700" />
                  </button>
                </div>
              </div>

              {/* Text Area */}
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={inputText}
                  onChange={handleTextareaChange}
                  placeholder="Write here..."
                  className="w-full h-60 sm:h-80 p-4 sm:p-6 resize-none focus:outline-none text-gray-900 text-sm leading-relaxed"
                />
              </div>
            </div>

            {/* Templates - Hidden on mobile, shown at bottom */}
            <div className="hidden lg:block bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Templates
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(Object.keys(sampleTemplates) as TemplateType[]).map(
                  (template) => (
                    <button
                      key={template}
                      onClick={() => loadTemplate(template)}
                      className="p-4 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-lg text-left transition-all duration-200"
                    >
                      <div className="text-sm font-medium text-gray-900 capitalize">
                        {template}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {template === "announcement"
                          ? "Share exciting news"
                          : template === "tip"
                          ? "Share knowledge"
                          : "Tell your story"}
                      </div>
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Preview */}
          <div className="space-y-4 sm:space-y-6 order-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              {/* Preview Header */}
              <div className="border-b border-gray-200 p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                    Post Preview
                  </h2>
                  <button
                    onClick={copyToClipboard}
                    className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 text-xs sm:text-sm ${
                      copied
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    <span>{copied ? "Copied!" : "Copy Text"}</span>
                  </button>
                </div>
              </div>

              {/* LinkedIn Post Mock */}
              <div className="p-3 sm:p-4">
                {/* Profile Header */}
                <div className="flex items-start space-x-3 mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-sm sm:text-lg">
                      YN
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-900 text-sm sm:text-base">
                        Your Name
                      </span>
                      <span className="text-blue-600">•</span>
                      <span className="text-blue-600 text-xs sm:text-sm">
                        3rd+
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      Full Stack Developer | AI Automation Expert
                    </div>
                    <div className="text-xs text-gray-500">2h • 🌍</div>
                  </div>
                </div>

                {/* Post Content */}
                <div className="mb-4 text-xs sm:text-sm">
                  {outputText ? (
                    <div className="whitespace-pre-wrap text-gray-900 leading-relaxed">
                      {outputText.split("\n").map((line, index) => (
                        <div key={index}>
                          {renderTextWithHashtags(line)}
                          {index < outputText.split("\n").length - 1 && <br />}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-400 italic">
                      Start writing and your post will appear here..
                      <br />
                      <br />
                      You can add images, links,{" "}
                      <span className="text-blue-600">#hashtags</span> and
                      emojis 😊
                    </div>
                  )}
                </div>

                {/* Engagement */}
                <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 mb-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-2">
                    <div className="flex -space-x-1">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-500 rounded-full border border-white flex items-center justify-center">
                        <span className="text-white text-xs">👍</span>
                      </div>
                      <div className="w-4 h-4 sm:w-5 sm:h-5 bg-red-500 rounded-full border border-white flex items-center justify-center">
                        <span className="text-white text-xs">❤️</span>
                      </div>
                    </div>
                    <span>24</span>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-4">
                    <span>5 comments</span>
                    <span>2 reposts</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-4 gap-1 sm:flex sm:items-center sm:justify-between pt-3 border-t border-gray-100">
                  <button className="flex items-center justify-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                    <span className="text-sm sm:text-lg">👍</span>
                    <span className="text-xs sm:text-sm font-medium hidden sm:inline">
                      Like
                    </span>
                  </button>
                  <button className="flex items-center justify-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                    <span className="text-sm sm:text-lg">💬</span>
                    <span className="text-xs sm:text-sm font-medium hidden sm:inline">
                      Comment
                    </span>
                  </button>
                  <button className="flex items-center justify-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                    <span className="text-sm sm:text-lg">🔄</span>
                    <span className="text-xs sm:text-sm font-medium hidden sm:inline">
                      Repost
                    </span>
                  </button>
                  <button className="flex items-center justify-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                    <Send size={16} />
                    <span className="text-xs sm:text-sm font-medium hidden sm:inline">
                      Send
                    </span>
                  </button>
                </div>
              </div>

              {/* Pro Tip */}
              <div className="border-t border-gray-200 p-3 sm:p-4">
                <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
                  <div className="text-xs sm:text-sm text-blue-800">
                    <strong>💡 Pro Tip:</strong> The output uses Unicode
                    characters that work perfectly on LinkedIn. Copy and paste
                    directly into your LinkedIn post!
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Templates - Show at bottom on mobile */}
          <div className="lg:hidden bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 order-3">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
              Quick Templates
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {(Object.keys(sampleTemplates) as TemplateType[]).map(
                (template) => (
                  <button
                    key={template}
                    onClick={() => loadTemplate(template)}
                    className="p-3 sm:p-4 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-lg text-left transition-all duration-200"
                  >
                    <div className="text-sm font-medium text-gray-900 capitalize">
                      {template}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {template === "announcement"
                        ? "Share exciting news"
                        : template === "tip"
                        ? "Share knowledge"
                        : "Tell your story"}
                    </div>
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkedInTextFormatter;
