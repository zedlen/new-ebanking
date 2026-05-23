import { Upload } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface FileDropzoneProps {
  onFile: (file: File) => void;
  accept?: string;
  disabled?: boolean;
  className?: string;
}

export function FileDropzone({
  onFile,
  accept = ".csv,.xlsx,.xls",
  disabled,
  className,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (file) onFile(file);
    },
    [onFile],
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        if (disabled) return;
        handleFile(e.dataTransfer.files[0]);
      }}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 text-center transition-colors",
        dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/30",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
    >
      <Upload className="text-muted-foreground size-10" />
      <div>
        <p className="font-medium">Arrastra el archivo o selecciona desde tus documentos</p>
        <p className="text-muted-foreground mt-1 text-sm">
          Formatos: CSV, Excel
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        disabled={disabled}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
