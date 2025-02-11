import { google } from "@ai-sdk/google";

import { streamText, convertToCoreMessages, smoothStream } from "ai";
import { z } from "zod";

// Cost constants
const COSTS = {
  'gpt-4o': {
    input: 2.50,
    cachedInput: 1.25,
    output: 10.00,
  },
  'gpt-4o-mini': {
    input: 0.150,
    cachedInput: 0.075,
    output: 0.600,
  },
  'o3-mini': {
    input: 1.10,
    cachedInput: 0.55,
    output: 4.40,
  }
} as const;

const BenefitsDataSchema = z
  .array(
    z.object({
      documentTitle: z.string(),
      documentContext: z.string(),
    })
  )
  .default([]);

// Add type safety for request body
const RequestSchema = z.object({
  messages: z.array(
    z.object({
      content: z.string(),
      role: z.enum(["user", "assistant", "system"]),
      experimental_attachments: z
        .array(
          z.object({
            url: z.string(),
            name: z.string().optional(),
            contentType: z.string().optional(),
          })
        )
        .optional(),
    })
  ),
  benefitsData: BenefitsDataSchema,
});

const SYSTEM_PROMPT = `You are a helpful bot called Brari (like library) that lets users ask questions about books. You will be given content - you should answer the questions based on the content.`;

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, benefitsData = [] } = RequestSchema.parse(body);
    const parsedBenefitsData = BenefitsDataSchema.parse(benefitsData);

    console.log(
      `Processing chat with ${parsedBenefitsData.length} benefit documents`
    );

    // Format the benefits data into a string
    const benefitsContext = benefitsData
      .map(({ documentTitle, documentContext }) => {
        return `Document: ${documentTitle}\nContext: ${documentContext}`;
      })
      .join('\n\n');

    const model = "o3-mini" as const;
    const result = await streamText({
      model: google("gemini-2.0-flash"),
      experimental_transform: smoothStream({
        delayInMs: 20,
        chunking: 'word',
      }),
      messages: [
        {
          role: "system",
          content: `${SYSTEM_PROMPT}\n\n*RAW BACKGROUND CONTEXT:*\n\n${benefitsContext}`,
        },
        ...convertToCoreMessages(messages),
      ],
      onStepFinish: (stepResult) => {
        const cachedPromptTokens = Number(stepResult.experimental_providerMetadata?.openai?.cachedPromptTokens ?? 0);
        const nonCachedPromptTokens = Number(stepResult.usage.promptTokens) - cachedPromptTokens;
        
        const rates = COSTS[model];
        const inputCost = (nonCachedPromptTokens * rates.input + cachedPromptTokens * rates.cachedInput) / 1_000_000;
        const outputCost = (Number(stepResult.usage.completionTokens) * rates.output) / 1_000_000;
        const totalCost = inputCost + outputCost;
        
        console.log('\n=== Chat Response Metrics ===');
        console.log('Model:', model);
        console.log('Token Usage:', {
          promptTokens: stepResult.usage.promptTokens,
          completionTokens: stepResult.usage.completionTokens,
          totalTokens: stepResult.usage.totalTokens,
          cachedPromptTokens
        });
        console.log('Estimated Cost:', {
          inputCost: `$${inputCost.toFixed(4)}`,
          outputCost: `$${outputCost.toFixed(4)}`,
          totalCost: `$${totalCost.toFixed(4)}`
        });
        console.log('===========================\n');
      }
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}
