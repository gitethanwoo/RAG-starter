"use client";

import { useChat } from "ai/react";
import { useState, useRef, useCallback } from "react";
import { useBenefits } from '@/providers/benefits-provider';
import { StoredDocument, ChatDocument } from '@/app/manage/types';
import { ChatInput } from "@/components/ui/chat-input";
import { ChatHeader } from "@/components/chat-header";
import { ChatLayout } from "@/components/chat-layout";
import { ChatMessages } from "@/components/chat-messages";
import { WelcomeScreen } from "@/components/welcome-screen";

function Brari() {
  const { benefits } = useBenefits();
  const [hasInteracted, setHasInteracted] = useState(false);
  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Transform benefits data to match the chat API schema
  const transformedBenefitsData = benefits.map((doc: StoredDocument): ChatDocument => ({
    documentTitle: doc.title,
    documentContext: doc.text,
  }));

  const { messages, input, handleInputChange, handleSubmit, isLoading, reload } = useChat({
    api: "/api/chat-web",
    body: {
      benefitsData: transformedBenefitsData,
    },
  });

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setHasInteracted(true);
    handleSubmit(e, {
      experimental_attachments: files,
    });

    // Reset file input after submission
    setFiles(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (newFiles: FileList | undefined) => {
    console.log("Parent handleFileChange:", {
      previousFiles: files?.length,
      newFiles: newFiles?.length,
      newFilesData: newFiles ? Array.from(newFiles).map((f) => f.name) : "none",
    });

    setFiles(newFiles);
  };

  const handleNewChat = useCallback(() => {
    setHasInteracted(false);
    setFiles(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    reload();
  }, [reload]);

  return (
    <ChatLayout hasInteracted={hasInteracted}>
      <ChatHeader hasInteracted={hasInteracted} onNewChat={handleNewChat} />

      <main className="flex-1 flex flex-col relative">
        {!hasInteracted ? (
          <WelcomeScreen 
            input={input}
            onChange={handleInputChange}
            onSubmit={handleFormSubmit}
            onFileChange={handleFileChange}
            files={files}
            isLoading={isLoading}
          />
        ) : (
          <>
            <div className="flex-1 overflow-hidden">
              <ChatMessages messages={messages} isLoading={isLoading} />
              <div className="h-32" />
            </div>
            
            <div className="w-full fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t z-10">
              <div className="max-w-2xl mx-auto w-full px-4 py-4">
                <ChatInput
                  value={input}
                  onChange={handleInputChange}
                  onSubmit={handleFormSubmit}
                  placeholder="Ask me anything..."
                  onFileChange={handleFileChange}
                  files={files}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Brari can make mistakes. Check important info.
                </p>
              </div>
            </div>
          </>
        )}
      </main>
    </ChatLayout>
  );
}

export default Brari;