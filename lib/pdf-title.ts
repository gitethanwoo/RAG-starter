import { generateObject } from "ai"
import { z } from "zod"
import { google } from '@ai-sdk/google';

export async function generatePDFTitle(text: string): Promise<{ title: string, author: string }> {
  const result = await generateObject({
    model: google('gemini-2.0-flash'),
    schema: z.object({
      title: z.string().describe('A clear, specific title for the document'),
      author: z.string().describe('The author of the document'),
    }),
    messages: [
      {
        role: "user",
        content: `Based on the following document content, provide a clear and specific title of the book, article, or document. It should reflect the actual title of the document, even if the title is not immediately clear from the text. For instance, if the text is 'It was the best of times, it was the worst of times...' You can infer the title is 'A Tale of Two Cities'. If the title is explicitly mentioned, use that. Also do your best to infer the author of the document, even if it is not explicitly mentioned. If it is unknown, return 'Unknown Author'. :\n\n${text.substring(0, 2000)}...`
      }
    ]
  });

  return {
    title: (await result.object).title,
    author: (await result.object).author
  };
} 