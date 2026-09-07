import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bot,
  RefreshCw,
  Send,
  Sparkles,
  User,
} from "lucide-react";

export default function AiChatbot({ records = [], datasetName = "Active Dataset", initialQuery = "" }) {
  const [messages, setMessages] = useState([
    {
      id: "initial-1",
      sender: "ai",
      text: `Hello! I am your AI Feedback Intelligence Copilot. I have analyzed all **${records.length} feedback records** in "${datasetName}".\n\nYou can ask me anything about customer sentiment, specific departments, pain points, or recommended actions. Or click one of the suggested prompts below!`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const lastInitialQueryRef = useRef("");


  // Compute live dataset statistics for dynamic responses
  const analysisStats = useMemo(() => {
    let pos = 0, neg = 0, mix = 0;
    const topicCounts = {};
    const negByTopic = {};
    const posByTopic = {};
    const emotionCounts = {};
    const quotes = { positive: [], negative: [] };

    records.forEach((r) => {
      const s = r.sentiment.toLowerCase();
      if (s.includes("pos")) {
        pos += 1;
        if (quotes.positive.length < 3) quotes.positive.push({ text: r.feedback, topic: r.topics[0] || "General" });
      } else if (s.includes("neg")) {
        neg += 1;
        if (quotes.negative.length < 3) quotes.negative.push({ text: r.feedback, topic: r.topics[0] || "General" });
      } else {
        mix += 1;
      }

      emotionCounts[r.emotion] = (emotionCounts[r.emotion] || 0) + 1;

      r.topics.forEach((t) => {
        topicCounts[t] = (topicCounts[t] || 0) + 1;
        if (s.includes("neg")) negByTopic[t] = (negByTopic[t] || 0) + 1;
        if (s.includes("pos")) posByTopic[t] = (posByTopic[t] || 0) + 1;
      });
    });

    const topNegativeTopics = Object.entries(negByTopic)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);

    const topPositiveTopics = Object.entries(posByTopic)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);

    const dominantEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Neutral";

    return {
      total: records.length,
      pos,
      neg,
      mix,
      posRate: records.length ? Math.round((pos / records.length) * 100) : 0,
      negRate: records.length ? Math.round((neg / records.length) * 100) : 0,
      topNegativeTopics,
      topPositiveTopics,
      dominantEmotion,
      quotes,
    };
  }, [records]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const promptSuggestions = [
    "What are the top 3 customer pain points?",
    "Why are people unhappy or frustrated?",
    "What are people loving most?",
    "Give me an executive 3-step action plan",
    "Which department needs immediate intervention?",
  ];

  const generateAnswer = (query) => {
    const q = query.toLowerCase();
    const { total, pos, neg, posRate, negRate, topNegativeTopics, topPositiveTopics, dominantEmotion, quotes } = analysisStats;

    if (q.includes("pain point") || q.includes("complaint") || q.includes("unhappy") || q.includes("frustrated") || q.includes("negative")) {
      const topIssues = topNegativeTopics.map(([t, count]) => `• **${t}**: ${count} complaints logged`).join("\n");
      const quoteExample = quotes.negative[0] ? `\n\n> *“${quotes.negative[0].text}”*` : "";
      return `Based on **${neg} negative feedback items (${negRate}% of total responses)**, here are the primary pain points:\n\n${topIssues}\n\nThe dominant negative emotion detected is **${dominantEmotion}**. A representative quote from users:${quoteExample}\n\n**Recommendation:** Prioritize the highest-frequency cluster immediately to stem further negative sentiment drift.`;
    }

    if (q.includes("love") || q.includes("positive") || q.includes("praise") || q.includes("best") || q.includes("working")) {
      const topWins = topPositiveTopics.map(([t, count]) => `• **${t}**: ${count} positive endorsements`).join("\n");
      const quoteExample = quotes.positive[0] ? `\n\n> *“${quotes.positive[0].text}”*` : "";
      return `Users are most satisfied with these high-performing areas (**${pos} positive responses, ${posRate}%**):\n\n${topWins}\n\nRepresentative praise from users:${quoteExample}\n\n**Takeaway:** Protect and celebrate these strengths; consider featuring them in marketing or internal best-practice workshops.`;
    }

    if (q.includes("action plan") || q.includes("recommend") || q.includes("steps") || q.includes("fix") || q.includes("executive")) {
      const top1 = topNegativeTopics[0]?.[0] || "Facilities";
      const top2 = topNegativeTopics[1]?.[0] || "Customer Support";
      return `### 3-Step High-Conviction Action Plan\n\n1. **Immediate Intervention on ${top1} (P0 Priority):**\n   - Conduct a 48-hour operational audit.\n   - Establish direct communication with impacted cohorts to communicate resolution timelines.\n\n2. **Process Re-engineering for ${top2} (P1 Priority):**\n   - Implement automated alerts and queue management to eliminate friction.\n\n3. **Continuous Sentiment Monitoring:**\n   - Track Net Sentiment Score (currently **${posRate - negRate}**) weekly to verify that corrective measures reflect in new feedback.`;
    }

    if (q.includes("department") || q.includes("immediate") || q.includes("intervention") || q.includes("worst")) {
      const worst = topNegativeTopics[0];
      if (worst) {
        return `The area requiring **most urgent intervention** is **${worst[0]}** with **${worst[1]} complaints**.\n\nThis represents the largest single source of user dissatisfaction. Addressing this first will yield the highest return on user sentiment.`;
      }
      return `Feedback is well-balanced across departments. Keep monitoring incoming streams for anomalies.`;
    }

    // Default intelligent overview
    return `Analysis summary for **${total} responses** in this dataset:\n\n• **Positive:** ${pos} (${posRate}%)\n• **Negative:** ${neg} (${negRate}%)\n• **Net Sentiment Score (NSS):** ${posRate - negRate}\n• **Primary Complaint Topic:** ${topNegativeTopics[0]?.[0] || "None"}\n• **Primary Strength:** ${topPositiveTopics[0]?.[0] || "None"}\n\nYou can ask me to drill into any specific topic or generate departmental briefs!`;
  };

  const handleSend = (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const answer = generateAnswer(query);
      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: answer,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 600);
  };

  const handleSendRef = useRef(handleSend);
  handleSendRef.current = handleSend;

  useEffect(() => {
    if (initialQuery && initialQuery.trim() && initialQuery !== lastInitialQueryRef.current) {
      lastInitialQueryRef.current = initialQuery;
      handleSendRef.current(initialQuery);
    }
  }, [initialQuery]);



  const clearChat = () => {
    setMessages([
      {
        id: "initial-reset",
        sender: "ai",
        text: `Chat reset. What would you like to explore across your **${records.length} feedback responses**?`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  return (
    <div className="shadcn-card chatbot-card">
      <div className="chatbot-header">
        <div className="bot-identity">
          <div className="bot-avatar">
            <Bot size={18} />
          </div>
          <div>
            <div className="bot-title-wrap">
              <h3>AI Feedback Copilot</h3>
              <span className="live-dot" />
            </div>
            <p>Query your feedback dataset in plain language</p>
          </div>
        </div>
        <button type="button" className="btn-icon-ghost" onClick={clearChat} title="Reset Conversation">
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="prompt-chips-row">
        <span className="chips-label">Quick Prompts:</span>
        <div className="chips-scroll">
          {promptSuggestions.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              className="prompt-chip"
              onClick={() => handleSend(prompt)}
            >
              <Sparkles size={11} /> {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="chat-messages-area">
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-message-row ${msg.sender === "user" ? "from-user" : "from-ai"}`}>
            <div className="msg-avatar">
              {msg.sender === "user" ? <User size={13} /> : <Sparkles size={13} />}
            </div>
            <div className="msg-content-wrapper">
              <div className="msg-bubble">
                <div className="markdown-body" style={{ whiteSpace: "pre-line" }}>
                  {msg.text}
                </div>
              </div>
              <span className="msg-time">{msg.timestamp}</span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="chat-message-row from-ai">
            <div className="msg-avatar">
              <Sparkles size={13} />
            </div>
            <div className="msg-bubble typing-bubble">
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Box */}
      <form
        className="chat-input-row"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
      >
        <input
          type="text"
          className="chat-input-field"
          placeholder="Ask a question about user feedback, complaints, or positive trends..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          className="chat-send-btn"
          disabled={!input.trim() || isTyping}
          title="Send message"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}
