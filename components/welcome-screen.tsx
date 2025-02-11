import Image from "next/image";
import { ChatInput } from "@/components/ui/chat-input";
import { useEffect, useRef } from "react";
import { useBenefits } from '@/providers/benefits-provider';
import { Plus } from "lucide-react";
import Link from "next/link";

interface WelcomeScreenProps {
  input: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onFileChange?: (files: FileList | undefined) => void;
  files?: FileList;
  isLoading?: boolean;
}

const BOOK_COLORS = [
  'bg-amber-900', // deep brown
  'bg-emerald-900', // dark forest green
  'bg-stone-800', // dark taupe
  'bg-slate-900', // nearly black
  'bg-red-900', // deep burgundy
  'bg-zinc-800', // charcoal
  'bg-neutral-900', // rich black
] as const;

export function WelcomeScreen({ 
  input, 
  onChange, 
  onSubmit,
  onFileChange,
  files,
  isLoading 
}: WelcomeScreenProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { benefits } = useBenefits();

  useEffect(() => {
    // Focus the input on mount
    inputRef.current?.focus();
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2 flex flex-col items-center">
          <div className="flex flex-col items-center">
            <div className="w-[160px] h-[160px] overflow-hidden">
              <Image 
                src="/files/brari-logo.png" 
                alt="Brari Logo" 
                width={240} 
                height={240}
                priority
              />
            </div>
          </div>
        </h1>
        <p className="text-lg text-muted-foreground text-balance mb-4">
          A helpful chatbot equipped to answer questions about your books.
        </p>
      </div>

      <div className="w-full max-w-2xl mx-auto">
        <ChatInput
          ref={inputRef}
          value={input}
          onChange={onChange}
          onSubmit={onSubmit}
          placeholder="Ask me anything..."
          onFileChange={onFileChange}
          files={files}
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground text-center mt-2">
          Brari can make mistakes. Check important info.
        </p>
        
        <div className="mt-8">
          <p className="text-sm text-muted-foreground text-center mb-4">
            Available Knowledge Sources ({benefits.length})
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 justify-items-center">
            {benefits.map((doc, index) => (
              <div 
                key={doc.redisKey || index}
                className={`relative w-full max-w-[160px] h-[200px] ${BOOK_COLORS[index % BOOK_COLORS.length]} rounded-sm border border-primary/10 p-3 flex flex-col shadow-sm hover:shadow-md transition-shadow duration-200 group`}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                <div className="w-full h-1 bg-white/20 mb-2 rounded-full" />
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-bold leading-tight text-white/90">
                    {doc.title}
                  </p>
                  <p className="text-xs text-white/70 italic">
                    {doc.author || 'Unknown Author'}
                  </p>
                </div>
              </div>
            ))}
            <Link 
              href="/manage"
              className="relative w-full max-w-[160px] h-[200px] border border-dashed border-primary/20 rounded-sm p-3 flex flex-col items-center justify-center gap-3 hover:bg-primary/5 transition-colors duration-200 group"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-200">
                <Plus className="w-5 h-5 text-primary/60" />
              </div>
              <p className="text-xs font-medium text-primary/60 text-center">
                Add a book
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 