import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { FileUpload } from "./file-upload";
import { useFileUpload } from "@/hooks/useFileUpload";
import { PDFConverter } from "@/components/pdf-converter";
import { useEffect, useCallback, useState } from "react";
import { useBenefits } from '@/providers/benefits-provider';

interface UploadCardProps {
  authToken: string;
}

export function UploadCard({ authToken }: UploadCardProps) {
  const { files, setFiles, isProcessing, clearFiles, setIsProcessing } = useFileUpload();
  const [progressMessages, setProgressMessages] = useState<string[]>([]);
  const { mutate } = useBenefits();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files && files.length > 0) {
      setIsProcessing(true);
      setProgressMessages([]); // Clear previous messages
    }
  };

  const handleProcessingComplete = useCallback((text: string, title: string, fileId: string) => {
    setFiles(prevFiles => 
      prevFiles.map(file => 
        file.id === fileId 
          ? { ...file, text, title } 
          : file
      )
    );
    setIsProcessing(false);
    // Refresh the knowledge base
    mutate();
  }, [setFiles, setIsProcessing, mutate]);

  const handleProcessingError = useCallback((error: string, fileId: string) => {
    setFiles(prevFiles => 
      prevFiles.map(file => 
        file.id === fileId 
          ? { ...file, error } 
          : file
      )
    );
    setIsProcessing(false);
  }, [setFiles, setIsProcessing]);

  const handleProgress = useCallback((message: string) => {
    setProgressMessages(prev => [...prev, message]);
  }, []);

  // Handle PDF conversion when isProcessing changes
  useEffect(() => {
    if (isProcessing && files && files.length > 0) {
      // Process each file
      files.forEach(file => {
        const converter = new PDFConverter({
          file: file.file,
          authToken,
          onComplete: (text, title) => handleProcessingComplete(text, title, file.id),
          onError: (error) => handleProcessingError(error, file.id),
          onProgress: handleProgress
        });
        converter.convert();
      });
    }
  }, [isProcessing, files, authToken, handleProcessingComplete, handleProcessingError, handleProgress]);

  return (
    <Card className="basis-1/2">
      <CardHeader>
        <CardTitle>Upload Documents</CardTitle>
        <CardDescription>
          Select one or more PDF files to process
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <FileUpload
                files={files}
                setFiles={setFiles}
                disabled={isProcessing}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              size="lg"
              disabled={!files || files.length === 0 || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing {files?.length} PDF
                  {files?.length !== 1 ? "s" : ""}...
                </>
              ) : (
                "Process PDFs"
              )}
            </Button>

            {files && files.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={clearFiles}
                disabled={isProcessing}
              >
                Clear Files
              </Button>
            )}
          </div>
        </form>

        {isProcessing && progressMessages.length > 0 && (
          <div className="mt-4 space-y-2">
            {progressMessages.map((message, index) => (
              <p key={index} className="text-sm text-muted-foreground">
                {message}
              </p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 