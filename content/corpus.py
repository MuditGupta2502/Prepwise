"""Build the shared tutor and vector-ingestion corpus from curriculum.json."""

import json
from pathlib import Path

CURRICULUM_PATH = Path(__file__).with_name("curriculum.json")


def load_knowledge_documents() -> list[dict[str, str]]:
    curriculum = json.loads(CURRICULUM_PATH.read_text(encoding="utf-8"))
    documents = []
    for track in curriculum["tracks"]:
        for lesson in track["lessons"]:
            body = "\n\n".join(
                [
                    lesson["content"],
                    f"Worked example ({lesson['example']['language']}):\n{lesson['example']['code']}\n{lesson['example']['explanation']}",
                    f"Knowledge check: {lesson['check']['question']}\nAnswer: {lesson['check']['options'][lesson['check']['answerIndex']]}. {lesson['check']['explanation']}",
                    f"Practice: {lesson['exercise']['prompt']}\nHint: {lesson['exercise']['hint']}\nSample solution: {lesson['exercise']['solution']}",
                ]
            )
            documents.append({
                "id": lesson["id"],
                "track": track["id"],
                "title": lesson["title"],
                "source": f"Prepwise · {track['title']} · {lesson['title']}",
                "body": body,
            })
    return documents
