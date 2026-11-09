import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bot,
  Check,
  Copy,
  Cpu,
  RefreshCw,
  Send,
  Sparkles,
  User,
} from "lucide-react";
import { askAiChatbot } from "../../services/api";

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function FormattedContent({ text }) {
  // Simple, safe markdown-like line processor with XSS sanitization
  const lines = text.split("\n");
  const elements = [];
  let listItems = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="chat-bullet-list">
          {listItems.map((item, idx) => (
            <li key={idx} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  const formatInline = (str) => {
    const escaped = escapeHtml(str);
    return escaped
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, "<code>$1</code>");
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      elements.push(<div key={`br-${index}`} className="chat-line-break" />);
      return;
    }

    if (trimmed.startsWith("### ")) {
      flushList();
      elements.push(
        <h4 key={`h-${index}`} className="chat-section-heading">
          {trimmed.replace(/^###\s+/, "")}
        </h4>
      );
    } else if (trimmed.startsWith("> ")) {
      flushList();
      elements.push(
        <blockquote
          key={`quote-${index}`}
          className="chat-quote-block"
          dangerouslySetInnerHTML={{ __html: formatInline(trimmed.replace(/^>\s+/, "")) }}
        />
      );
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("• ") || trimmed.startsWith("* ")) {
      listItems.push(formatInline(trimmed.replace(/^[-•*]\s+/, "")));
    } else {

      flushList();
      elements.push(
        <p
          key={`p-${index}`}
          className="chat-paragraph"
          dangerouslySetInnerHTML={{ __html: formatInline(trimmed) }}
        />
      );
    }
  });

  flushList();
  return <div className="formatted-chat-body">{elements}</div>;
}

export default function AiChatbot({
  records = [],
  datasetName = "Active Dataset",
  initialQuery = "",
}) {
  const [messages, setMessages] = useState([
    {
      id: "initial-1",
      sender: "ai",
      text: `Hello! I am your **FeedSense AI Copilot**.\n\nI have indexed all **${records.length.toLocaleString()} feedback records** in "${datasetName}". Ask me about user sentiment, recurring complaints, or action plans.`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);
  const lastInitialQueryRef = useRef("");

  // Compute live dataset statistics for dynamic prompt suggestions & context
  const analysisStats = useMemo(() => {
    let pos = 0, neg = 0, mix = 0;
    const topicCounts = {};
    const negByTopic = {};
    const posByTopic = {};
    const emotionCounts = {};
    const quotes = { positive: [], negative: [] };

    records.forEach((r) => {
      const s = String(r.sentiment || "").toLowerCase();
      if (s.includes("pos")) {
        pos += 1;
        if (quotes.positive.length < 3) {
          quotes.positive.push({ text: r.feedback || r.cleaned_text || "", topic: r.topics?.[0] || "General" });
        }
      } else if (s.includes("neg")) {
        neg += 1;
        if (quotes.negative.length < 3) {
          quotes.negative.push({ text: r.feedback || r.cleaned_text || "", topic: r.topics?.[0] || "General" });
        }
      } else {
        mix += 1;
      }

      if (r.emotion) {
        emotionCounts[r.emotion] = (emotionCounts[r.emotion] || 0) + 1;
      }

      (r.topics || []).forEach((t) => {
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

  const promptSuggestions = useMemo(() => {
    const topNeg = analysisStats.topNegativeTopics[0]?.[0];
    const topPos = analysisStats.topPositiveTopics[0]?.[0];
    return [
      "What are the top 3 customer pain points?",
      topNeg ? `Why are users unhappy with ${topNeg}?` : "Why are users unhappy or frustrated?",
      topPos ? `What do users love about ${topPos}?` : "What are people loving most?",
      "Give me an executive 3-step action plan",
      "Which department needs immediate intervention?",
    ];
  }, [analysisStats]);

  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || isTyping) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await askAiChatbot({
        message: query,
        history: messages.slice(-6),
        datasetSummary: analysisStats,
        records,
        datasetName,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: response.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          model: response.model || "Google Gemini",
        },
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gemini is temporarily unavailable.";
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-error-${Date.now()}`,
          sender: "ai",
          text: `**Gemini unavailable.** ${message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          model: "Gemini unavailable",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendRef = useRef(handleSend);
  handleSendRef.current = handleSend;

  useEffect(() => {
    if (initialQuery && initialQuery.trim() && initialQuery !== lastInitialQueryRef.current) {
      lastInitialQueryRef.current = initialQuery;
      handleSendRef.current(initialQuery);
    }
  }, [initialQuery]);

  const copyMessage = (id, text) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const clearChat = () => {
    setMessages([
      {
        id: "initial-reset",
        sender: "ai",
        text: `Conversation reset. What would you like to explore across your **${records.length.toLocaleString()} feedback responses**?`,
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
        <button
          type="button"
          className="btn-icon-ghost"
          onClick={clearChat}
          title="Reset Conversation"
          aria-label="Reset conversation"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="prompt-chips-row">
        <div className="prompt-chips-header">
          <span className="chips-label">Quick Prompts:</span>
          <button
            type="button"
            className="chips-reset-btn"
            onClick={clearChat}
            title="Reset Chat"
          >
            <RefreshCw size={11} /> Reset
          </button>
        </div>
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
          <div
            key={msg.id}
            className={`chat-message-row ${msg.sender === "user" ? "from-user" : "from-ai"}`}
          >
            <div className="msg-avatar">
              {msg.sender === "user" ? <User size={13} /> : <Sparkles size={13} />}
            </div>
            <div className="msg-content-wrapper">
              <div className="msg-bubble">
                <FormattedContent text={msg.text} />
              </div>
              <div className="msg-meta-row">
                <span className="msg-time">{msg.timestamp}</span>
                {msg.sender === "ai" && (
                  <>
                    {msg.model && (
                      <span className="msg-model-tag">
                        <Cpu size={10} /> {msg.model}
                      </span>
                    )}
                    <button
                      type="button"
                      className="msg-copy-btn"
                      onClick={() => copyMessage(msg.id, msg.text)}
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check size={11} className="icon-copied" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy size={11} /> Copy
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="chat-message-row from-ai">
            <div className="msg-avatar">
              <Sparkles size={13} />
            </div>
            <div className="msg-content-wrapper">
              <div className="msg-bubble typing-bubble">
                <span className="typing-text">Waiting for Gemini</span>
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
              </div>
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
          placeholder="Ask AI anything about complaints, positive trends, or departments..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isTyping}
        />
        <button
          type="submit"
          className="chat-send-btn"
          disabled={!input.trim() || isTyping}
          title="Send message"
          aria-label="Send message"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}
