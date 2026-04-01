-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to products
ALTER TABLE "products" ADD COLUMN "embedding" vector(1536);

-- Create HNSW index for cosine similarity search
CREATE INDEX "products_embedding_idx" ON "products" USING hnsw ("embedding" vector_cosine_ops);
