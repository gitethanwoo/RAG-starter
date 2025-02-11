<thinking>
Let me break this down into a clear, step-by-step implementation plan that follows KISS principles.
Core Requirements:
Break long-running PDF processing into manageable chunks
Use Redis for state management and job coordination
Maintain progress tracking for user feedback
Handle errors gracefully at each stage
Keep the API surface simple for the frontend
Key Design Decisions:
Use Redis Hash sets for job state management
Keep the existing frontend interface mostly unchanged
Split processing into 3 distinct phases: Initialize → Process Pages → Aggregate
</thinking>
Implementation Plan:
Redis Schema Design

interface JobState {
  id: string;               // Unique job ID
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalPages: number;
  processedPages: number;
  error?: string;
  createdAt: number;
  updatedAt: number;
  chunks: {                 // Track chunk processing status
    [chunkId: string]: {
      status: 'pending' | 'completed' | 'failed';
      pages: number[];      // Page numbers in this chunk
      result?: string;      // Processed text for these pages
    }
  }
}


// New endpoints needed:
POST /api/jobs/create      // Initialize job
GET /api/jobs/:id/status   // Check job status
POST /api/jobs/:id/process // Process a specific chunk
GET /api/jobs/:id/result   // Get final result

Implementation Phases
Phase 1: Job Initialization
Create job record in Redis
Split pages into chunks of 20
Return job ID to client
Start processing first chunk
Phase 2: Chunk Processing
Process chunks independently
Store results in Redis
Update job progress
Trigger next chunk processing
Phase 3: Job Completion
Aggregate all chunk results
Generate final title
Clean up temporary data
Return complete document
Frontend Changes
Add polling mechanism for job status
Update progress UI to show both overall and chunk progress
Handle long-running jobs gracefully
Error Handling & Recovery
Track failed chunks separately
Implement retry mechanism for failed chunks
Allow manual retry of failed jobs
Clean up stale jobs automatically
Would you like me to proceed with implementing any specific part of this plan? I recommend we start with either:
Setting up the Redis schema and job management functions
Modifying the API endpoints to support the new workflow
Updating the frontend to handle long-running jobs
Which would you prefer to tackle first?