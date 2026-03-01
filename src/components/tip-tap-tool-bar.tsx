import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Editor } from "@tiptap/react";

import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Italic,
  Link2,
  List,
  ListOrdered,
  Paintbrush,
  Palette,
  Quote,
  Redo,
  Strikethrough,
  Type,
  Underline,
  Undo,
  Youtube,
} from "lucide-react";
import { toast } from "sonner";

const TipTapMenuBar = ({ editor }: { editor: Editor }) => {
  const addYoutubeVideo = () => {
    const url = prompt("Enter YouTube URL");
    if (url) editor.chain().focus().setYoutubeVideo({ src: url }).run();
  };

  const setLink = () => {
    const url = prompt("Enter URL");
    if (url) {
      editor.chain().focus().toggleLink({ href: url }).run();
    }
  };

  const setCustomColor = (color: string) => {
    // Ensure it's a valid color format before applying
    const isValidColor = /^#[0-9A-F]{6}$/i.test(color);
    if (isValidColor) {
      editor.chain().focus().setColor(color).run();
    } else {
      toast.error("Invalid color code!");
    }
  };

  return (
    <div className="flex flex-wrap gap-2 items-center py-2">
      {/* Text Formatting */}
      <div className="flex gap-2 border-r pr-2">
        <Button
          onClick={() => editor.chain().focus().toggleBold().run()}
          variant={editor.isActive("bold") ? "default" : "outline"}
          type="button"
          size="sm"
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          variant={editor.isActive("italic") ? "default" : "outline"}
          size="sm"
          type="button"
        >
          <Italic className="w-4 h-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          variant={editor.isActive("underline") ? "default" : "outline"}
          size="sm"
          type="button"
        >
          <Underline className="w-4 h-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          variant={editor.isActive("strike") ? "default" : "outline"}
          size="sm"
          type="button"
        >
          <Strikethrough className="w-4 h-4" />
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" type="button" size="sm">
              <Type className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2">
            <div className="grid grid-cols-2 gap-1">
              {[1, 2, 3, 4, 5, 6].map((level) => (
                <Button
                  key={level}
                  onClick={() =>
                    editor
                      .chain()
                      .focus()
                      .toggleHeading({ level: level as 1 | 2 | 3 | 4 | 5 | 6 })
                      .run()
                  }
                  variant={
                    editor.isActive("heading", { level }) ? "default" : "ghost"
                  }
                  size="sm"
                  type="button"
                  className="h-8"
                >
                  H{level}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Headings & Text Alignment */}
      <div className="flex gap-2 border-r pr-2">
        <Button
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          variant={
            editor.isActive({ textAlign: "left" }) ? "default" : "outline"
          }
          size="sm"
          type="button"
        >
          <AlignLeft className="w-4 h-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          variant={
            editor.isActive({ textAlign: "center" }) ? "default" : "outline"
          }
          size="sm"
          type="button"
        >
          <AlignCenter className="w-4 h-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          variant={
            editor.isActive({ textAlign: "right" }) ? "default" : "outline"
          }
          size="sm"
          type="button"
        >
          <AlignRight className="w-4 h-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          variant={
            editor.isActive({ textAlign: "justify" }) ? "default" : "outline"
          }
          size="sm"
          type="button"
        >
          <AlignJustify className="w-4 h-4" />
        </Button>
      </div>

      {/* Lists & Blocks */}
      <div className="flex gap-2 border-r pr-2">
        <Button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          variant={editor.isActive("bulletList") ? "default" : "outline"}
          size="sm"
          type="button"
        >
          <List className="w-4 h-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          variant={editor.isActive("orderedList") ? "default" : "outline"}
          size="sm"
          type="button"
        >
          <ListOrdered className="w-4 h-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          variant={editor.isActive("blockquote") ? "default" : "outline"}
          size="sm"
          type="button"
        >
          <Quote className="w-4 h-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          variant={editor.isActive("codeBlock") ? "default" : "outline"}
          size="sm"
          type="button"
        >
          <Code className="w-4 h-4" />
        </Button>
      </div>

      {/* Media & Links */}
      <div className="flex gap-2 border-r pr-2">
        <Button type="button" onClick={setLink} variant="outline" size="sm">
          <Link2 className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          onClick={addYoutubeVideo}
          variant="outline"
          size="sm"
        >
          <Youtube className="w-4 h-4" />
        </Button>
      </div>

      {/* Colors */}
      <div className="flex gap-2 border-r pr-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" size="sm">
              <Paintbrush className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2">
            <div className="grid grid-cols-4 gap-1">
              {[
                "#ef04b1",
                "#39a8db",
                "#000000",
                "#ef4444",
                "#3b82f6",
                "#10b981",
                "#f59e0b",
                "#ffffff",
              ].map((color) => (
                <Button
                  key={color}
                  onClick={() => editor.chain().focus().setColor(color).run()}
                  style={{ backgroundColor: color }}
                  className="h-8 w-8 rounded-full border shadow-sm"
                />
              ))}
            </div>
            <Input
              type="text"
              placeholder="Enter hex color code"
              onBlur={(e) => setCustomColor(e.target.value)}
              className="mt-2 p-2 border rounded w-full"
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" size="sm">
              <Palette className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2">
            <Input
              type="color"
              onChange={(e) =>
                editor.chain().focus().setColor(e.target.value).run()
              }
              className="h-10 w-full"
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* History */}
      <div className="flex gap-2">
        <Button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          variant="outline"
          type="button"
          size="sm"
        >
          <Undo className="w-4 h-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          variant="outline"
          type="button"
          size="sm"
        >
          <Redo className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default TipTapMenuBar;
