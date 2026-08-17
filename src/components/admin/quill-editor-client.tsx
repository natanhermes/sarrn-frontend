"use client";

import { useMemo, useRef } from "react";
import ReactQuill from "react-quill-new";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api-error";
import {
  isVideoFile,
  isVideoUrl,
  MEDIA_ACCEPT,
  uploadImage,
} from "@/lib/upload";
import { cn } from "@/lib/utils";

import "react-quill-new/dist/quill.snow.css";

if (typeof window !== "undefined" && ReactQuill?.Quill) {
  try {
    const BlockEmbed = ReactQuill.Quill.import("blots/block/embed") as any;

    class CustomVideoBlot extends BlockEmbed {
      static blotName = "video";
      static tagName = "video";

      static create(value: string) {
        const node = super.create(value) as HTMLVideoElement;
        node.setAttribute("src", value);
        node.setAttribute("controls", "true");
        node.setAttribute("preload", "metadata");
        node.setAttribute("playsinline", "true");
        node.setAttribute("controlslist", "nodownload");
        node.setAttribute(
          "class",
          "mx-auto my-4 max-w-full rounded-lg object-contain",
        );
        return node;
      }

      static value(node: HTMLVideoElement) {
        return node.getAttribute("src");
      }
    }

    (ReactQuill.Quill as any).register("formats/video", CustomVideoBlot, true);
  } catch (err) {
    console.error("Failed to register custom video blot for Quill:", err);
  }
}

type QuillEditorClientProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  storagePath?: string;
};

const QUILL_FORMATS = [
  "header",
  "bold",
  "italic",
  "underline",
  "align",
  "list",
  "link",
  "image",
  "video",
];

export default function QuillEditorClient({
  value,
  onChange,
  disabled = false,
  invalid = false,
  storagePath,
}: QuillEditorClientProps) {
  const quillRef = useRef<ReactQuill | null>(null);

  const modules = useMemo(() => {
    const handleMediaUpload = () => {
      if (disabled) {
        return;
      }

      const input = document.createElement("input");
      input.type = "file";
      input.accept = MEDIA_ACCEPT;
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) {
          return;
        }

        try {
          const url = await uploadImage(file, storagePath);
          const editor = quillRef.current?.getEditor();
          if (!editor) {
            return;
          }

          const range = editor.getSelection(true);
          const index = range?.index ?? editor.getLength();

          const isVid = isVideoFile(file) || isVideoUrl(url);
          const embedType = isVid ? "video" : "image";

          editor.insertEmbed(index, embedType, url, "user");
          editor.setSelection(index + 1, 0, "silent");
        } catch (error) {
          toast.error(
            getApiErrorMessage(
              error,
              "Não foi possível enviar a mídia do editor.",
            ),
          );
        }
      };
      input.click();
    };

    return {
      toolbar: {
        container: [
          [{ header: [2, 3, false] }],
          ["bold", "italic", "underline"],
          [{ align: [] }, { list: "ordered" }, { list: "bullet" }],
          ["link", "image", "video", "clean"],
        ],
        handlers: {
          image: handleMediaUpload,
          video: handleMediaUpload,
        },
      },
    };
  }, [disabled, storagePath]);

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "overflow-hidden rounded-md border border-input bg-background",
          "[&_.ql-toolbar.ql-snow]:border-0 [&_.ql-toolbar.ql-snow]:border-b [&_.ql-toolbar.ql-snow]:border-border [&_.ql-toolbar.ql-snow]:bg-muted/40",
          "[&_.ql-container.ql-snow]:border-0",
          "[&_.ql-editor]:min-h-40 [&_.ql-editor]:text-sm [&_.ql-editor]:text-foreground",
          "[&_.ql-editor.ql-blank::before]:text-muted-foreground",
          "[&_.ql-stroke]:stroke-foreground/70 [&_.ql-fill]:fill-foreground/70 [&_.ql-picker]:text-foreground/80",
          "[&_.ql-editor_video]:mx-auto [&_.ql-editor_video]:my-4 [&_.ql-editor_video]:max-w-full [&_.ql-editor_video]:rounded-lg",
          invalid && "border-destructive ring-3 ring-destructive/20",
          disabled && "pointer-events-none opacity-60",
        )}
      >
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={value || ""}
          readOnly={disabled}
          modules={modules}
          formats={QUILL_FORMATS}
          placeholder="Escreva o conteúdo da publicação..."
          onChange={(html) => {
            onChange(html);
          }}
        />
      </div>

      <p className="text-sm text-muted-foreground">
        Envie imagens ou vídeos (MP4, WEBM até 100MB). Para disponibilizar PDFs
        para leitura e download, utilize a seção de Anexos abaixo.
      </p>
    </div>
  );
}
