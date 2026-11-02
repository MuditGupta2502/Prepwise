from __future__ import annotations

import asyncio
import os
import sys
from pathlib import Path

import httpx
import psycopg
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
load_dotenv(ROOT / ".env")
from content.corpus import load_knowledge_documents  # noqa: E402


async def embed(client: httpx.AsyncClient, text: str) -> list[float]:
    if os.getenv("GEMINI_API_KEY"):
        model = os.getenv("GEMINI_EMBEDDING_MODEL", "gemini-embedding-001")
        response = await client.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/{model}:embedContent",
            headers={"x-goog-api-key": os.environ["GEMINI_API_KEY"]},
            json={"taskType": "RETRIEVAL_DOCUMENT", "outputDimensionality": 1536, "content": {"parts": [{"text": text}]}},
        )
        payload = response.json()
        if response.is_error:
            raise RuntimeError(payload.get("error", {}).get("message", f"Gemini embedding failed ({response.status_code})"))
        return payload["embedding"]["values"]
    response = await client.post(
        "https://api.openai.com/v1/embeddings",
        headers={"Authorization": f"Bearer {os.environ['OPENAI_API_KEY']}"},
        json={"model": os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small"), "input": text, "dimensions": 1536},
    )
    payload = response.json()
    if response.is_error:
        raise RuntimeError(payload.get("error", {}).get("message", f"OpenAI embedding failed ({response.status_code})"))
    return payload["data"][0]["embedding"]


async def main() -> None:
    if not os.getenv("DATABASE_URL") or not (os.getenv("GEMINI_API_KEY") or os.getenv("OPENAI_API_KEY")):
        raise SystemExit("Set DATABASE_URL and GEMINI_API_KEY or OPENAI_API_KEY in .env before indexing.")
    docs = load_knowledge_documents()
    options = {"sslmode": "require"} if os.getenv("PGSSL", "").lower() == "true" else {}
    async with httpx.AsyncClient(timeout=60) as client:
        with psycopg.connect(os.environ["DATABASE_URL"], **options) as connection:
            for doc in docs:
                embedding = await embed(client, f"{doc['title']}\n{doc['body']}")
                vector = "[" + ",".join(str(value) for value in embedding) + "]"
                connection.execute(
                    "INSERT INTO knowledge_chunks(id,track,title,source,body,embedding) VALUES(%s,%s,%s,%s,%s,%s::vector) "
                    "ON CONFLICT(id) DO UPDATE SET track=EXCLUDED.track,title=EXCLUDED.title,source=EXCLUDED.source,body=EXCLUDED.body,embedding=EXCLUDED.embedding",
                    (doc["id"], doc["track"], doc["title"], doc["source"], doc["body"], vector),
                )
                connection.commit()
                print(f"Indexed {doc['id']}")


if __name__ == "__main__":
    asyncio.run(main())
