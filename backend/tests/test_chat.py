import unittest

from app.chat import ChatRequest, chat_with_copilot, _format_context, _generate_local_reply


class ChatTests(unittest.TestCase):
    def setUp(self) -> None:
        self.sample_records = [
            {
                "feedback": "The library wifi keeps dropping every 5 minutes, very frustrating.",
                "sentiment": "Negative",
                "topics": ["WiFi", "Library"],
                "emotion": "Frustration",
            },
            {
                "feedback": "Professors in the Computer Science department are brilliant and supportive.",
                "sentiment": "Positive",
                "topics": ["Academics", "Faculty"],
                "emotion": "Gratitude",
            },
            {
                "feedback": "The cafeteria food is decent but seating is limited.",
                "sentiment": "Mixed",
                "topics": ["Cafeteria", "Facilities"],
                "emotion": "Neutral",
            },
        ]

    def test_format_context_summary(self) -> None:
        context = _format_context(
            records=self.sample_records,
            summary={"total": 3, "positive": 1, "negative": 1, "mixed": 1},
            dataset_name="Test College Feedback",
            query="wifi issue",
        )
        self.assertIn("Test College Feedback", context)
        self.assertIn("1 Positive", context)
        self.assertIn("1 Negative", context)
        self.assertIn("library wifi", context.lower())

    def test_chat_copilot_fallback_reply(self) -> None:
        req = ChatRequest(
            message="What are the top complaints?",
            records=self.sample_records,
            dataset_name="Test Dataset",
        )
        res = chat_with_copilot(req)
        self.assertIsNotNone(res)
        self.assertIn("reply", res)
        self.assertIn("status", res)
        self.assertTrue(len(res["reply"]) > 20)

    def test_query_matching_records(self) -> None:
        reply = _generate_local_reply(
            message="Tell me about library wifi",
            records=self.sample_records,
            summary={"total": 3, "positive": 1, "negative": 1, "mixed": 1},
            dataset_name="Test Dataset",
        )
        self.assertIn("library wifi", reply.lower())
        self.assertIn("sentiment:", reply.lower())


if __name__ == "__main__":
    unittest.main()
