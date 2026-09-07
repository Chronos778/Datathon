import unittest

from app.analyzer import analyze_rows, classify_sentiment, extract_topics


class AnalyzerTests(unittest.TestCase):
    def test_positive_sentiment(self) -> None:
        sentiment, score, confidence = classify_sentiment(
            "The campus wifi is fast and excellent."
        )
        self.assertEqual(sentiment, "Positive")
        self.assertGreater(score, 0.5)
        self.assertGreater(confidence, 0.5)

    def test_negative_sentiment(self) -> None:
        sentiment, score, confidence = classify_sentiment(
            "The portal is slow, confusing, and frustrating."
        )
        self.assertEqual(sentiment, "Negative")
        self.assertLess(score, 0.5)
        self.assertGreater(confidence, 0.5)

    def test_topic_extraction(self) -> None:
        self.assertEqual(extract_topics("Wifi disconnects in the hostel"), ["Campus Wifi", "Hostel"])

    def test_preserves_transformed_values(self) -> None:
        record = analyze_rows(
            [
                {
                    "feedback": "A response",
                    "sentiment": "Positive",
                    "emotion": "Joy",
                    "topics": '["Custom Topic"]',
                    "keywords": '["custom"]',
                    "aspect_sentiments": '[{"aspect":"Custom Topic","sentiment":"Positive"}]',
                }
            ]
        )[0]
        self.assertEqual(record.sentiment, "Positive")
        self.assertEqual(record.emotion, "Joy")
        self.assertEqual(record.topics, ["Custom Topic"])
        self.assertEqual(record.keywords, ["custom"])
        self.assertEqual(record.aspect_sentiments[0].aspect, "Custom Topic")


if __name__ == "__main__":
    unittest.main()
