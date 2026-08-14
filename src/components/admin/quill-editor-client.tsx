"use client";

import { useMemo, useRef } from "react";
import ReactQuill from "react-quill-new";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api-error";
import { IMAGE_ACCEPT, uploadImage } from "@/lib/upload";
import { cn } from "@/lib/utils";

import "react-quill-new/dist/quill.snow.css";

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
];

export default function QuillEditorClient({
  value,
  onChange,
  disabled = false,
  invalid = false,
  storagePath,
}: QuillEditorClientProps) {
  const quillRef = useRef<ReactQuill | null>(null);

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [2, 3, false] }],
          ["bold", "italic", "underline"],
          [{ align: [] }, { list: "ordered" }, { list: "bullet" }],
          ["link", "image", "clean"],
        ],
        handlers: {
          image: () => {
            if (disabled) {
              return;
            }

            const input = document.createElement("input");
            input.type = "file";
            input.accept = IMAGE_ACCEPT;
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
                editor.insertEmbed(index, "image", url, "user");
                editor.setSelection(index + 1, 0, "silent");
              } catch (error) {
                toast.error(
                  getApiErrorMessage(
                    error,
                    "Não foi possível enviar a imagem do editor.",
                  ),
                );
              }
            };
            input.click();
          },
        },
      },
    }),
    [disabled, storagePath],
  );

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
        Para disponibilizar PDFs para leitura e download, utilize a seção de
        Anexos abaixo.
      </p>
    </div>
  );
}
