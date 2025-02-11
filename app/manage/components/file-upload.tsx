import { cn } from "@/lib/utils";
import { useState, useRef } from "react";
import { Upload, FileText } from "lucide-react";

interface FileData {
  id: string;
  name: string;
  size: string;
  type: string;
  file: File;
  title: string | null;
  text: string | null;
  error?: string;
}

interface FileUploadProps {
  files: FileData[];
  setFiles: (files: FileData[]) => void;
  disabled?: boolean;
}

export function FileUpload({ files, setFiles, disabled = false }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    if (!droppedFiles) return;

    // Filter for only PDF files
    const pdfFiles = Array.from(droppedFiles).filter(file => 
      file.type === 'application/pdf'
    );

    if (pdfFiles.length === 0) return;

    // Create new FileData objects
    const newFiles = pdfFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: `${(file.size / (1024*1024)).toFixed(2)} MB`,
      type: file.type,
      file: file,
      title: null,
      text: null
    }));

    setFiles(newFiles);
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = event.target.files;
    if (!newFiles) return;

    // Create new FileData objects
    const fileDataArray = Array.from(newFiles).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: `${(file.size / (1024*1024)).toFixed(2)} MB`,
      type: file.type,
      file: file,
      title: null,
      text: null
    }));

    setFiles(fileDataArray);
  };

  return (
    <div
      className={cn(
        "relative border-2 border-dashed rounded-lg transition-all duration-150",
        "min-h-[200px] cursor-pointer",
        isDragging 
          ? "border-primary bg-primary/5 scale-[0.99]" 
          : "border-muted hover:border-primary/50 hover:bg-primary/[0.015]",
        disabled && "opacity-50 cursor-not-allowed hover:border-muted hover:bg-transparent"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={disabled ? undefined : handleFileClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        multiple
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
      
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6">
        {files && files.length > 0 ? (
          <div className="w-full">
            <div className="flex flex-wrap gap-4 justify-center">
              {files.map((file) => (
                <div key={file.id} className="text-center">
                  <div className="w-16 h-16 mx-auto mb-2 bg-primary/10 rounded-lg flex items-center justify-center">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground max-w-[100px] truncate">
                    {file.name}
                  </p>
                  {file.error && (
                    <p className="text-xs text-destructive mt-1">
                      {file.error}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <p className="text-sm text-center mt-4 text-muted-foreground">
              {files.length} PDF{files.length !== 1 ? 's' : ''} selected
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-full bg-primary/10 p-4">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">Drop PDF files here or click to upload</p>
              <p className="text-xs text-muted-foreground mt-1">
                Upload one or more PDF documents to process
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 