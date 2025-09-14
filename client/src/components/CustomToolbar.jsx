import React from "react";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link,
  Image,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Minus,
} from "lucide-react";

const ToolbarButton = ({ onClick, isActive, disabled, children, title }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-2 rounded border transition-colors ${
      isActive
        ? "bg-blue-100 border-blue-300 text-blue-700"
        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
    } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
  >
    {children}
  </button>
);

const ToolbarDivider = () => <div className="w-px h-6 bg-gray-300 mx-1" />;

export function CustomToolbar({ editor }) {
  if (!editor) {
    return null;
  }

  const addImage = () => {
    const url = window.prompt("Enter image URL:");
    if (url) {
      // Basic URL validation
      try {
        new URL(url);
        editor.chain().focus().setImage({ src: url }).run();
      } catch (error) {
        alert("Please enter a valid URL");
      }
    }
  };

  const addLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL:", previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    // Basic URL validation and auto-prefix
    let validUrl = url;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      validUrl = "https://" + url;
    }

    try {
      new URL(validUrl);
      // update link
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: validUrl })
        .run();
    } catch (error) {
      alert("Please enter a valid URL");
    }
  };

  return (
    <div className="flex items-center gap-1 p-2 bg-gray-50 border-b border-gray-200 flex-wrap">
      {/* Undo/Redo */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo"
      >
        <Undo size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo"
      >
        <Redo size={16} />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Text Formatting */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
        title="Bold"
      >
        <Bold size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
        title="Italic"
      >
        <Italic size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive("strike")}
        title="Strikethrough"
      >
        <Strikethrough size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive("code")}
        title="Inline Code"
      >
        <Code size={16} />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Headings */}
      <ToolbarButton
        onClick={() => {
          if (editor.isActive("heading", { level: 1 })) {
            editor.chain().focus().setParagraph().run();
          } else {
            editor.chain().focus().toggleHeading({ level: 1 }).run();
          }
        }}
        isActive={editor.isActive("heading", { level: 1 })}
        title="Heading 1"
      >
        <Heading1 size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => {
          if (editor.isActive("heading", { level: 2 })) {
            editor.chain().focus().setParagraph().run();
          } else {
            editor.chain().focus().toggleHeading({ level: 2 }).run();
          }
        }}
        isActive={editor.isActive("heading", { level: 2 })}
        title="Heading 2"
      >
        <Heading2 size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => {
          if (editor.isActive("heading", { level: 3 })) {
            editor.chain().focus().setParagraph().run();
          } else {
            editor.chain().focus().toggleHeading({ level: 3 }).run();
          }
        }}
        isActive={editor.isActive("heading", { level: 3 })}
        title="Heading 3"
      >
        <Heading3 size={16} />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Lists */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive("bulletList")}
        title="Bullet List"
      >
        <List size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive("orderedList")}
        title="Numbered List"
      >
        <ListOrdered size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        isActive={editor.isActive("taskList")}
        title="Task List"
      >
        ☑
      </ToolbarButton>

      <ToolbarDivider />

      {/* Block Elements */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive("blockquote")}
        title="Quote"
      >
        <Quote size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        isActive={editor.isActive("codeBlock")}
        title="Code Block"
      >
        {"{}"}
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Horizontal Rule"
      >
        <Minus size={16} />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Alignment */}
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        isActive={
          editor.isActive({ textAlign: "left" }) ||
          (!editor.isActive({ textAlign: "center" }) &&
            !editor.isActive({ textAlign: "right" }))
        }
        title="Align Left"
      >
        <AlignLeft size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        isActive={editor.isActive({ textAlign: "center" })}
        title="Align Center"
      >
        <AlignCenter size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        isActive={editor.isActive({ textAlign: "right" })}
        title="Align Right"
      >
        <AlignRight size={16} />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Media */}
      <ToolbarButton
        onClick={addLink}
        isActive={editor.isActive("link")}
        title={editor.isActive("link") ? "Edit Link" : "Add Link"}
      >
        <Link size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={addImage} title="Add Image">
        <Image size={16} />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Utilities */}
      <ToolbarButton
        onClick={() =>
          editor.chain().focus().clearNodes().unsetAllMarks().run()
        }
        title="Clear Formatting"
      >
        ✂️
      </ToolbarButton>
    </div>
  );
}

export default CustomToolbar;
