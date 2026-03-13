import { cn } from "@/lib/utils";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { FieldLabel } from "./field";

interface RichInputProps {
  name?: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
  height?: string | number;
  actionBtn?: React.ReactNode;
}

const modules = {
  toolbar: [
    [{ header: [1, 2, false] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [
      { list: "ordered" },
      { list: "bullet" },
      { indent: "-1" },
      { indent: "+1" },
    ],
    ["link", "image"],
    ["clean"],
  ],
};

const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "list",
  "bullet",
  "indent",
  "link",
  "image",
];

export function RichInput({
  name,
  value,
  onChange,
  label,
  required = false,
  placeholder,
  height = "200px",
  actionBtn,
}: RichInputProps) {

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        {label && (
          <FieldLabel htmlFor={name}>
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </FieldLabel>
        )}
        {actionBtn && <div>{actionBtn}</div>}
      </div>
      <div
        className={cn(
          "border-input flex flex-col rounded-md border bg-transparent shadow-sm"
        )}
      >
        <ReactQuill
          theme="snow"
          value={value || ""}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={
            placeholder
              ? placeholder
              : ""
          }
          className="flex flex-col overflow-hidden"
          style={{
            height: height,
            display: "flex",
            flexDirection: "column",
          }}
        />
      </div>
      <style>{`
            .ql-toolbar {
              border: none !important;
              border-bottom: 1px solid hsl(var(--input)) !important;
              border-radius: calc(var(--radius) - 2px) calc(var(--radius) - 2px) 0 0;
              background: hsl(var(--muted) / 0.3);
            }
            .ql-container {
              border: none !important;
              border-radius: 0 0 calc(var(--radius) - 2px) calc(var(--radius) - 2px);
              font-family: inherit;
              font-size: 0.875rem;
              flex: 1;
              display: flex;
              flex-direction: column;
            }
            .ql-editor {
              min-height: ${
                typeof height === "number" ? `${height}px` : height
              };
              flex: 1;
            }
            .ql-editor.ql-blank::before {
              font-style: normal;
              color: hsl(var(--muted-foreground));
            }
          `}</style>
    </div>
  );
}

RichInput.displayName = "RichInput";
