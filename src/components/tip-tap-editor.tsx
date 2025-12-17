"use client";
import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import React, { useEffect } from "react";
import TipTapMenuBar from "./tip-tap-tool-bar";
import { TextAlign } from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Link } from "@tiptap/extension-link";
import { Underline } from "@tiptap/extension-underline";
import { Youtube } from "@tiptap/extension-youtube";
import { Image } from "@tiptap/extension-image";
import { EDITOR_PROSE } from "@/lib/prose";

const TipTapEditor = ({
    onValueChange,
    content = "<h1>Type Here</h1>"
}: {
    onValueChange: (content: string) => void,
    content: string
}) => {
    const editor = useEditor({
        autofocus: false,
        extensions: [
            StarterKit.configure({
                // optionally remove marks you don't need to avoid conflicts
            }),
            TextStyle, // <-- must be before Color
            Color.configure({ types: ['textStyle'] }), // or types like ['textStyle', 'paragraph', 'heading']
            Underline,
            Link.configure({
                openOnClick: false,
                autolink: true,
            }),
            Youtube.configure({
                inline: false,
                controls: true,
            }),
            Image.configure({
                inline: true,
                allowBase64: true,
            }),
            // ResizableImage,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
                alignments: ['left', 'center', 'right', 'justify'],
            }),
        ],
        immediatelyRender: false,
        editorProps: { attributes: { class: `${EDITOR_PROSE} focus:outline-none` } },
        content,
        onUpdate: ({ editor }) => {
            onValueChange(editor.getHTML());
        },
    });

    // ✅ IMPORTANT: Sync editor when `content` prop changes (DB hydration/reset)
    useEffect(() => {
        if (!editor) return;

        const incoming = content || "<p></p>";
        const current = editor.getHTML();

        // only update if different (prevents cursor-jumping / loops)
        if (incoming !== current) {
            // `false` = do NOT add to history stack
            editor.commands.setContent(incoming);
        }
    }, [content, editor]);


    return (
        <div className="border border-blue-100 font-inter rounded-xl  overflow-hidden">
            {!editor ? (
                <div className="w-full text-center py-8">
                    <span className="text-gray-500 text-sm">Loading editor...</span>
                </div>
            ) : (
                <>
                    <div className="flex w-full px-4 justify-start py-3 border-b">
                        <TipTapMenuBar editor={editor} />
                    </div>

                    <div className="px-4 py-3 min-h-[320px]">
                        <EditorContent editor={editor} />
                    </div>
                </>
            )}
        </div>
    );
};

export default TipTapEditor;