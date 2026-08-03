import { Redis } from "@upstash/redis"
import { logger } from "@/lib/logger"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
})

interface QueueJob {
  id: string
  type: string
  data: unknown
  attempts: number
  maxAttempts: number
  createdAt: Date
  processAt: Date
}

class SimpleQueue {
  private memoryJobs: Map<string, QueueJob> = new Map()
  private processors: Map<string, (data: unknown) => Promise<void>> = new Map()
  private isProcessing = false

  async addJob(type: string, data: unknown, delay = 0): Promise<string> {
    const id = crypto.randomUUID()
    const job: QueueJob = {
      id,
      type,
      data,
      attempts: 0,
      maxAttempts: 3,
      createdAt: new Date(),
      processAt: new Date(Date.now() + delay),
    }

    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      try {
        await redis.lpush(`queue:${type}`, JSON.stringify(job));
        return id;
      } catch (e) {
        logger.error("Failed to push to Redis queue", e);
      }
    }

    // Memory fallback
    this.memoryJobs.set(id, job)
    this.processJobs()
    return id
  }

  registerProcessor(type: string, processor: (data: unknown) => Promise<void>) {
    this.processors.set(type, processor)
  }

  private async processJobs() {
    if (this.isProcessing) return
    this.isProcessing = true

    const now = new Date()
    const readyJobs = Array.from(this.memoryJobs.values()).filter((job) => job.processAt <= now)

    for (const job of readyJobs) {
      try {
        const processor = this.processors.get(job.type)
        if (processor) {
          await processor(job.data)
          this.memoryJobs.delete(job.id)
        }
      } catch (error) {
        job.attempts++
        if (job.attempts >= job.maxAttempts) {
          console.error(`Job ${job.id} failed after ${job.maxAttempts} attempts:`, error)
          this.memoryJobs.delete(job.id)
        } else {
          job.processAt = new Date(Date.now() + Math.pow(2, job.attempts) * 1000) // Exponential backoff
        }
      }
    }

    this.isProcessing = false

    // Schedule next processing for memory fallback
    if (this.memoryJobs.size > 0) {
      setTimeout(() => this.processJobs(), 5000)
    }
  }
}

export const queue = new SimpleQueue()

// Register processors
queue.registerProcessor("send-email", async (data) => {
  // Email sending logic
  logger.info("Sending email:", data)
})

queue.registerProcessor("verify-medicine", async (data) => {
  // Medicine verification logic
  logger.info("Verifying medicine:", data)
})
