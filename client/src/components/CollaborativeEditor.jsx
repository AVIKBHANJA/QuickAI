import React, { Suspense } from "react";
import {
  useLiveblocksExtension,
  FloatingComposer,
  FloatingThreads,
  FloatingToolbar,
  AnchoredThreads,
  Toolbar,
} from "@liveblocks/react-tiptap";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import { Image } from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import Youtube from "@tiptap/extension-youtube";
import { useThreads } from "@liveblocks/react";
import Avatars from "./Avatars";
import CustomToolbar from "./CustomToolbar";
import "./CollaborativeEditor.css";

// Document spinner component
function DocumentSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
    </div>
  );
}

// Main collaborative editor component
export function CollaborativeEditor() {
  return (
    <Suspense fallback={<DocumentSpinner />}>
      <Editor />
    </Suspense>
  );
}

// Custom Task Item
const CustomTaskItem = TaskItem.extend({
  content: "inline*",
  addAttributes() {
    return {
      ...this.parent?.(),
      class: {
        default: "tiptap-task-item",
        renderHTML: (attributes) => {
          return {
            class: attributes.class,
          };
        },
      },
    };
  },
});

// Main editor component
function Editor() {
  const liveblocks = useLiveblocksExtension({
    offlineSupport_experimental: true,
  });

  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "collaborative-editor prose prose-lg max-w-none focus:outline-none",
        spellcheck: "false",
      },
    },
    extensions: [
      liveblocks,
      StarterKit.configure({
        blockquote: {
          HTMLAttributes: {
            class: "tiptap-blockquote",
          },
        },
        code: {
          HTMLAttributes: {
            class: "tiptap-code",
          },
        },
        codeBlock: {
          languageClassPrefix: "language-",
          HTMLAttributes: {
            class: "tiptap-code-block",
            spellcheck: false,
          },
        },
        heading: {
          levels: [1, 2, 3],
          HTMLAttributes: {
            class: "tiptap-heading",
          },
        },
        history: false, // Liveblocks handles history
        horizontalRule: {
          HTMLAttributes: {
            class: "tiptap-hr",
          },
        },
        listItem: {
          HTMLAttributes: {
            class: "tiptap-list-item",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "tiptap-ordered-list",
          },
        },
        paragraph: {
          HTMLAttributes: {
            class: "tiptap-paragraph",
          },
        },
      }),
      Highlight.configure({
        HTMLAttributes: {
          class: "tiptap-highlight",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "tiptap-image",
        },
      }),
      Link.configure({
        HTMLAttributes: {
          class: "tiptap-link",
        },
      }),
      Placeholder.configure({
        placeholder: "Start writing your collaborative document...",
        emptyEditorClass: "tiptap-empty",
      }),
      CustomTaskItem,
      TaskList.configure({
        HTMLAttributes: {
          class: "tiptap-task-list",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Typography,
      Youtube.configure({
        modestBranding: true,
        HTMLAttributes: {
          class: "tiptap-youtube",
        },
      }),
    ],
  });

  return (
    <div className="collaborative-editor-container">
      {/* Header with toolbar */}
      <div className="editor-header">
        <div className="flex items-center justify-between w-full">
          <div className="flex-1">
            <Toolbar editor={editor} className="toolbar" />
            {/* Fallback to custom toolbar if Liveblocks toolbar doesn't render */}
            {!editor && <CustomToolbar editor={editor} />}
          </div>
          <Avatars />
        </div>
      </div>

      {/* Main editor area */}
      <div className="editor-content-wrapper">
        <div className="editor-content">
          <EditorContent editor={editor} />

          {/* Floating composer for comments */}
          <FloatingComposer editor={editor} style={{ width: 350 }} />

          {/* Floating toolbar */}
          <FloatingToolbar editor={editor} />

          {/* Floating threads for comments */}
          <FloatingThreads editor={editor} />
        </div>

        {/* Anchored threads (comments on the side) */}
        <div className="threads-sidebar">
          <AnchoredThreads editor={editor} />
        </div>
      </div>
    </div>
  );
}

export default CollaborativeEditor;
