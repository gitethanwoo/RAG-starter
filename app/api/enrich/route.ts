import { Redis } from '@upstash/redis';
import { generatePDFTitle } from '@/lib/pdf-title';

export const maxDuration = 300;

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

interface ProcessedDocument {
  title: string;
  text: string;
  author?: string;
  pdf_link: string;
  redisKey?: string;
}

async function getUniqueFileName(baseFileName: string): Promise<string> {
  const baseName = baseFileName.replace('.json', '');
  let index = 0;
  let fileName = `${baseName}.json`;

  try {
    while (await redis.exists(`docs:${fileName}`)) {
      index++;
      fileName = `${baseName}_${index}.json`;
    }
  } catch (error) {
    console.error('Error checking key existence in Redis:', error);
  }

  return fileName;
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (authHeader !== `Bearer ${process.env.ENRICH_PASSWORD}`) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text } = await req.json();
    
    if (!text) {
      return Response.json({ error: 'No text provided' }, { status: 400 });
    }

    const { title, author } = await generatePDFTitle(text);
    const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fileName = await getUniqueFileName(safeTitle);

    const document: ProcessedDocument = {
      title,
      text,
      pdf_link: '',
      author,
      redisKey: `docs:${fileName}`
    };

    // Store in Redis
    await redis.set(document.redisKey!, JSON.stringify(document));

    return Response.json({ 
      text: document.text,
      title: document.title,
      author: document.author
    });

  } catch (error) {
    console.error('Error in POST handler:', error);
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
