"use client";

import dynamic from "next/dynamic";

const QuillEditorClient = dynamic(
  () => import("@/components/admin/quill-editor-client"),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-2">
        <div className="flex min-h-48 items-center justify-center rounded-md border border-input bg-muted/30 text-sm text-muted-foreground">
          Carregando editor...
        </div>
        <p className="text-sm text-muted-foreground">
          Para disponibilizar PDFs para leitura e download, utilize a seção de
          Anexos abaixo.
        </p>
      </div>
    ),
  },
);

type QuillEditorProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  storagePath?: string;
};

export function QuillEditor(props: QuillEditorProps) {
  return <QuillEditorClient {...props} />;
}
