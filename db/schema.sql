CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS knowledge_chunks (
  id text PRIMARY KEY,
  track text NOT NULL CHECK (track IN ('dsa', 'competitive', 'lld', 'hld', 'ai')),
  title text NOT NULL,
  source text NOT NULL,
  body text NOT NULL,
  embedding vector(1536),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS knowledge_chunks_track_idx ON knowledge_chunks(track);
CREATE INDEX IF NOT EXISTS knowledge_chunks_embedding_idx
  ON knowledge_chunks USING hnsw (embedding vector_cosine_ops);
