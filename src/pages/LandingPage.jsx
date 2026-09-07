import { useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bell,
  Bot,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  FileText,
  Filter,
  Heart,
  Layers3,
  Menu,
  MessageSquareText,
  Minus,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Tags,
  TrendingUp,
  Upload,
  Users,
  X,
  Zap,
} from "lucide-react";

const dashboardViews = {
  "Last 30 days": {
    total: "12,842",
    score: 68,
    change: "+8.4%",
    positive: 68,
    neutral: 21,
    negative: 11,
    chart: "M0,104 C42,94 49,64 91,70 C132,76 140,39 181,48 C223,57 230,25 272,32 C315,39 326,5 368,20 C402,32 425,11 468,8",
    topics: [
      ["Ease of use", 84, "+12%"],
      ["Support speed", 67, "+8%"],
      ["Mobile experience", 54, "+4%"],
      ["Pricing clarity", 39, "-3%"],
    ],
  },
  "Last 90 days": {
    total: "34,905",
    score: 64,
    change: "+4.7%",
    positive: 64,
    neutral: 23,
    negative: 13,
    chart: "M0,97 C37,108 58,70 95,79 C137,88 146,54 188,58 C232,62 238,42 281,50 C325,59 337,19 378,31 C418,43 434,14 468,20",
    topics: [
      ["Ease of use", 78, "+8%"],
      ["Support speed", 63, "+5%"],
      ["Pricing clarity", 51, "+2%"],
      ["Mobile experience", 46, "-1%"],
    ],
  },
  "This year": {
    total: "118,420",
    score: 61,
    change: "+11.2%",
    positive: 61,
    neutral: 25,
    negative: 14,
    chart: "M0,110 C39,86 52,99 92,82 C129,67 148,80 188,58 C222,40 243,67 283,45 C320,25 341,47 381,27 C417,9 433,30 468,10",
    topics: [
      ["Support speed", 73, "+18%"],
      ["Ease of use", 69, "+10%"],
      ["Product reliability", 58, "+7%"],
      ["Pricing clarity", 44, "+1%"],
    ],
  },
};

const sentimentData = {
  All: {
    label: "All feedback",
    quotes: [
      {
        sentiment: "positive",
        text: "The new onboarding flow was incredibly simple. I was up and running in minutes.",
        source: "Post-purchase survey",
        time: "12 min ago",
        topic: "Ease of use",
      },
      {
        sentiment: "negative",
        text: "I had to contact support twice before the billing issue was properly understood.",
        source: "Support ticket",
        time: "31 min ago",
        topic: "Support speed",
      },
      {
        sentiment: "neutral",
        text: "The mobile app works well, but exporting reports is easier on desktop.",
        source: "App store review",
        time: "1 hr ago",
        topic: "Mobile experience",
      },
    ],
  },
  Positive: {
    label: "Positive feedback",
    quotes: [
      {
        sentiment: "positive",
        text: "The new onboarding flow was incredibly simple. I was up and running in minutes.",
        source: "Post-purchase survey",
        time: "12 min ago",
        topic: "Ease of use",
      },
      {
        sentiment: "positive",
        text: "Support solved our integration question in one clear reply. Brilliant experience.",
        source: "Support ticket",
        time: "42 min ago",
        topic: "Support quality",
      },
      {
        sentiment: "positive",
        text: "The weekly insights email helps our team focus on exactly what customers need.",
        source: "Customer interview",
        time: "2 hrs ago",
        topic: "Reporting",
      },
    ],
  },
  Negative: {
    label: "Negative feedback",
    quotes: [
      {
        sentiment: "negative",
        text: "I had to contact support twice before the billing issue was properly understood.",
        source: "Support ticket",
        time: "31 min ago",
        topic: "Support speed",
      },
      {
        sentiment: "negative",
        text: "The pricing page did not make the usage limits clear before we upgraded.",
        source: "NPS survey",
        time: "3 hrs ago",
        topic: "Pricing clarity",
      },
      {
        sentiment: "negative",
        text: "Notifications sometimes arrive too late for our team to take action.",
        source: "Community comment",
        time: "5 hrs ago",
        topic: "Alerts",
      },
    ],
  },
  Neutral: {
    label: "Neutral feedback",
    quotes: [
      {
        sentiment: "neutral",
        text: "The mobile app works well, but exporting reports is easier on desktop.",
        source: "App store review",
        time: "1 hr ago",
        topic: "Mobile experience",
      },
      {
        sentiment: "neutral",
        text: "We use the dashboard weekly and would like more custom date presets.",
        source: "Customer interview",
        time: "4 hrs ago",
        topic: "Filters",
      },
      {
        sentiment: "neutral",
        text: "Setup took about the time we expected and the documentation was sufficient.",
        source: "Onboarding survey",
        time: "7 hrs ago",
        topic: "Onboarding",
      },
    ],
  },
};

const useCases = [
  {
    icon: Users,
    title: "Colleges",
    text: "Understand student experience across surveys, course reviews, and support conversations.",
  },
  {
    icon: Heart,
    title: "Healthcare",
    text: "Surface patient concerns early and identify the care moments that shape trust.",
  },
  {
    icon: BarChart3,
    title: "Retail",
    text: "Connect product reviews and store feedback to the issues affecting loyalty and revenue.",
  },
  {
    icon: Zap,
    title: "Startups",
    text: "Turn every interview, ticket, and comment into a sharper product roadmap.",
  },
];

const faqs = [
  [
    "What kinds of feedback can I analyse?",
    "FeedSense works with survey responses, reviews, support tickets, interview notes, social comments, and other text-based feedback. Sources can be uploaded as CSV files or connected through integrations.",
  ],
  [
    "How does sentiment analysis work?",
    "Each feedback item is evaluated in context and classified as positive, neutral, or negative. The dashboard then aggregates those signals while preserving the original quote for verification.",
  ],
  [
    "Can I filter results for a specific audience?",
    "Yes. Combine time period, source, category, topic, location, audience segment, and sentiment filters to answer focused questions without writing queries.",
  ],
  [
    "Do I need technical experience?",
    "No. FeedSense is designed for people who need answers, not analysts. Plain-language summaries, guided filters, and transparent source quotes make every insight understandable.",
  ],
  [
    "Is the dashboard using real customer data?",
    "This frontend demo uses realistic sample data. In a production implementation, the same interface can be connected to your preferred analysis and storage services.",
  ],
];

function Logo() {
  return (
    <a className="brand" href="#top" aria-label="FeedSense home">
      <span className="brand-mark" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      <span>FeedSense</span>
    </a>
  );
}

function Header({ menuOpen, setMenuOpen, onAnalyze }) {
  return (
    <header className="site-header">
      <div className="nav-shell">
        <Logo />
        <nav className={menuOpen ? "main-nav is-open" : "main-nav"} aria-label="Main navigation">
          <a href="#platform" onClick={() => setMenuOpen(false)}>
            Platform <ChevronDown size={13} />
          </a>
          <a href="#solutions" onClick={() => setMenuOpen(false)}>
            Solutions <ChevronDown size={13} />
          </a>
          <a href="#how-it-works" onClick={() => setMenuOpen(false)}>
            How it works
          </a>
          <a href="#resources" onClick={() => setMenuOpen(false)}>
            Resources <ChevronDown size={13} />
          </a>
        </nav>
        <div className="nav-actions">
          <a className="text-link" href="#dashboard">
            Sign in
          </a>
          <a
            className="outline-button small"
            href="/analyze"
            onClick={(event) => {
              event.preventDefault();
              onAnalyze();
            }}
          >
            Analyze feedback
          </a>
        </div>
        <button
          className="menu-button"
          type="button"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </header>
  );
}

function Sparkline({ tone = "blue" }) {
  return (
    <svg className={`sparkline ${tone}`} viewBox="0 0 112 36" role="img" aria-label="Upward trend">
      <path d="M2 30 C17 27 22 20 35 23 C48 26 54 12 67 17 C78 21 90 7 110 5" />
    </svg>
  );
}

function Dashboard({ period, setPeriod, sentiment, setSentiment }) {
  const view = dashboardViews[period];
  const selectedFeedback = sentimentData[sentiment];

  return (
    <div className="dashboard-frame" id="dashboard">
      <div className="dashboard-windowbar">
        <div className="window-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="window-address">
          <ShieldCheck size={12} />
          app.feedsense.ai/overview
        </div>
        <span className="window-user">AM</span>
      </div>
      <div className="dashboard-app">
        <aside className="dashboard-sidebar" aria-label="Dashboard navigation">
          <div className="mini-brand">
            <span />
            <span />
            <span />
          </div>
          <button className="side-icon active" aria-label="Overview" type="button">
            <BarChart3 size={17} />
          </button>
          <button className="side-icon" aria-label="Feedback" type="button">
            <MessageSquareText size={17} />
          </button>
          <button className="side-icon" aria-label="Topics" type="button">
            <Tags size={17} />
          </button>
          <button className="side-icon" aria-label="Reports" type="button">
            <FileText size={17} />
          </button>
          <button className="side-icon bottom" aria-label="Settings" type="button">
            <Settings size={17} />
          </button>
        </aside>
        <div className="dashboard-content">
          <div className="dashboard-topbar">
            <div>
              <p className="dash-overline">Overview</p>
              <h2>Good morning, Alex</h2>
            </div>
            <div className="dashboard-controls">
              <label className="dash-select">
                <CalendarDays size={14} />
                <span className="sr-only">Time period</span>
                <select value={period} onChange={(event) => setPeriod(event.target.value)}>
                  {Object.keys(dashboardViews).map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
                <ChevronDown size={13} />
              </label>
              <button className="icon-button" aria-label="Notifications" type="button">
                <Bell size={16} />
                <span className="notification-dot" />
              </button>
              <button className="avatar-button" aria-label="Account menu" type="button">
                AM
              </button>
            </div>
          </div>

          <div className="dashboard-filter-row" aria-label="Feedback sentiment filter">
            <div className="dashboard-filter-title">
              <Sparkles size={14} />
              <span>AI summary refreshed 4 min ago</span>
            </div>
            <div className="sentiment-tabs">
              {Object.keys(sentimentData).map((item) => (
                <button
                  className={sentiment === item ? "active" : ""}
                  type="button"
                  key={item}
                  onClick={() => setSentiment(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="metric-grid">
            <article className="metric-card">
              <div className="metric-heading">
                <span>Total feedback</span>
                <MessageSquareText size={15} />
              </div>
              <div className="metric-value">
                {view.total}
                <span className="trend-up">
                  <TrendingUp size={11} /> {view.change}
                </span>
              </div>
              <p>vs. previous period</p>
            </article>
            <article className="metric-card sentiment-score">
              <div className="metric-heading">
                <span>Sentiment score</span>
                <Activity size={15} />
              </div>
              <div className="metric-value">
                {view.score}
                <span className="trend-up">
                  <TrendingUp size={11} /> 5.2
                </span>
              </div>
              <Sparkline />
            </article>
            <article className="metric-card">
              <div className="metric-heading">
                <span>Topics identified</span>
                <Tags size={15} />
              </div>
              <div className="metric-value">
                24
                <span className="metric-subtle">7 emerging</span>
              </div>
              <p>across 6 channels</p>
            </article>
            <article className="metric-card">
              <div className="metric-heading">
                <span>Priority alerts</span>
                <CircleAlert size={15} />
              </div>
              <div className="metric-value">
                6
                <span className="metric-alert">2 new</span>
              </div>
              <p>need attention this week</p>
            </article>
          </div>

          <div className="analytics-grid">
            <article className="panel trend-panel">
              <div className="panel-header">
                <div>
                  <p className="panel-eyebrow">Sentiment over time</p>
                  <h3>Customer feeling is improving</h3>
                </div>
                <button className="panel-action" type="button">
                  View report <ChevronRight size={13} />
                </button>
              </div>
              <div className="line-chart">
                <div className="chart-y">
                  <span>80</span>
                  <span>60</span>
                  <span>40</span>
                  <span>20</span>
                </div>
                <div className="chart-plot">
                  <div className="grid-line line-a" />
                  <div className="grid-line line-b" />
                  <div className="grid-line line-c" />
                  <div className="grid-line line-d" />
                  <svg viewBox="0 0 468 122" preserveAspectRatio="none" role="img" aria-label="Sentiment trend">
                    <defs>
                      <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="var(--signal-blue)" stopOpacity=".28" />
                        <stop offset="100%" stopColor="var(--signal-blue)" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d={`${view.chart} L468,122 L0,122 Z`} className="chart-area" />
                    <path d={view.chart} className="chart-line" />
                    <circle cx="368" cy="20" r="4" className="chart-dot" />
                  </svg>
                  <div className="chart-tooltip">
                    <strong>72</strong>
                    <span>Aug 26</span>
                  </div>
                </div>
                <div className="chart-x">
                  <span>Aug 1</span>
                  <span>Aug 8</span>
                  <span>Aug 15</span>
                  <span>Aug 22</span>
                  <span>Aug 30</span>
                </div>
              </div>
            </article>

            <article className="panel breakdown-panel">
              <div className="panel-header">
                <div>
                  <p className="panel-eyebrow">Sentiment breakdown</p>
                  <h3>{selectedFeedback.label}</h3>
                </div>
                <button className="icon-button compact" aria-label="Filter sentiment chart" type="button">
                  <Filter size={14} />
                </button>
              </div>
              <div className="donut-row">
                <div
                  className="donut"
                  style={{
                    "--positive-stop": `${view.positive * 3.6}deg`,
                    "--neutral-stop": `${(view.positive + view.neutral) * 3.6}deg`,
                  }}
                  aria-label={`${view.positive}% positive, ${view.neutral}% neutral, ${view.negative}% negative`}
                >
                  <div>
                    <strong>{view.score}</strong>
                    <span>score</span>
                  </div>
                </div>
                <div className="legend">
                  <div>
                    <span className="legend-label positive">Positive</span>
                    <strong>{view.positive}%</strong>
                  </div>
                  <div>
                    <span className="legend-label neutral">Neutral</span>
                    <strong>{view.neutral}%</strong>
                  </div>
                  <div>
                    <span className="legend-label negative">Negative</span>
                    <strong>{view.negative}%</strong>
                  </div>
                </div>
              </div>
            </article>

            <article className="panel topics-panel">
              <div className="panel-header">
                <div>
                  <p className="panel-eyebrow">Leading themes</p>
                  <h3>Top topics</h3>
                </div>
                <button className="panel-action" type="button">
                  See all <ChevronRight size={13} />
                </button>
              </div>
              <div className="topic-list">
                {view.topics.map(([name, value, change], index) => (
                  <div className="topic-row" key={name}>
                    <span className="topic-rank">{String(index + 1).padStart(2, "0")}</span>
                    <div className="topic-name">
                      <div>
                        <strong>{name}</strong>
                        <span>{value * 13} mentions</span>
                      </div>
                      <div className="topic-bar">
                        <span style={{ width: `${value}%` }} />
                      </div>
                    </div>
                    <span className={change.startsWith("-") ? "topic-change down" : "topic-change"}>
                      {change}
                    </span>
                  </div>
                ))}
              </div>
            </article>

            <article className="panel feedback-panel">
              <div className="panel-header">
                <div>
                  <p className="panel-eyebrow">Live feedback</p>
                  <h3>What people are saying</h3>
                </div>
                <span className="live-label">
                  <span /> Live
                </span>
              </div>
              <div className="feedback-list">
                {selectedFeedback.quotes.map((quote) => (
                  <div className="feedback-row" key={quote.text}>
                    <span className={`sentiment-marker ${quote.sentiment}`} />
                    <div>
                      <p>“{quote.text}”</p>
                      <span>
                        {quote.source} · {quote.time}
                      </span>
                    </div>
                    <span className="topic-pill">{quote.topic}</span>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}

function SourceStrip() {
  const sources = [
    ["SURVEYS", MessageSquareText],
    ["REVIEWS", Star],
    ["SUPPORT", Bell],
    ["SOCIAL", Users],
    ["INTERVIEWS", FileText],
    ["COMMUNITY", Layers3],
  ];
  return (
    <section className="source-strip" aria-label="Supported feedback sources">
      <p>One clear view across every feedback channel</p>
      <div>
        {sources.map(([name, Icon]) => (
          <span key={name}>
            <Icon size={19} strokeWidth={1.8} /> {name}
          </span>
        ))}
      </div>
    </section>
  );
}

function AskSection() {
  const [question, setQuestion] = useState("What is driving negative sentiment this month?");
  const [submitted, setSubmitted] = useState(true);

  function ask(event) {
    event.preventDefault();
    setSubmitted(Boolean(question.trim()));
  }

  return (
    <section className="section-shell ask-section" id="platform">
      <div className="section-intro">
        <div>
          <p className="eyebrow">Ask FeedSense</p>
          <h2>Ask any question, get analyst-quality answers</h2>
        </div>
        <p>
          Move from raw comments to a quantified answer in seconds. Every finding links back to the
          source feedback, so your team can understand the evidence behind it.
        </p>
      </div>

      <div className="ask-grid">
        <div className="ask-card">
          <div className="ask-card-top">
            <div className="ai-avatar">
              <Sparkles size={18} />
            </div>
            <div>
              <strong>Feedback analyst</strong>
              <span>Grounded in 12,842 feedback items</span>
            </div>
            <span className="verified-label">
              <Check size={12} /> Sources verified
            </span>
          </div>
          <form onSubmit={ask} className="question-box">
            <label htmlFor="feedback-question">Ask a question about your feedback</label>
            <div>
              <input
                id="feedback-question"
                value={question}
                onChange={(event) => {
                  setQuestion(event.target.value);
                  setSubmitted(false);
                }}
                placeholder="What are customers telling us?"
              />
              <button type="submit" aria-label="Ask question">
                <Send size={16} />
              </button>
            </div>
          </form>
          <div className={submitted ? "answer-card visible" : "answer-card"}>
            <div className="answer-heading">
              <Bot size={17} />
              <strong>Answer</strong>
              <span>Generated now</span>
            </div>
            <p>
              Negative sentiment is mainly driven by <strong>billing clarity</strong> and{" "}
              <strong>support response time</strong>. Together they account for 61% of negative
              comments, with billing mentions rising 18% since last month.
            </p>
            <div className="answer-evidence">
              <span>
                <FileText size={13} /> 326 source quotes
              </span>
              <span>
                <Activity size={13} /> 91% confidence
              </span>
              <button type="button">
                Explore evidence <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </div>
        <div className="insight-visual">
          <div className="visual-grid" />
          <div className="floating-query query-one">
            <Search size={14} />
            “Why are users leaving?”
          </div>
          <div className="floating-query query-two">
            <Search size={14} />
            “What should we fix first?”
          </div>
          <div className="signal-orbit orbit-one" />
          <div className="signal-orbit orbit-two" />
          <div className="visual-core">
            <div className="core-ring">
              <Sparkles size={26} />
            </div>
            <span>12.8k signals</span>
            <strong>One clear answer</strong>
          </div>
        </div>
      </div>

      <div className="capability-grid">
        <article>
          <span className="feature-icon">
            <Sparkles size={18} />
          </span>
          <h3>Context-aware analysis</h3>
          <p>Understand meaning, nuance, and sentiment beyond simple keyword matching.</p>
        </article>
        <article>
          <span className="feature-icon">
            <FileText size={18} />
          </span>
          <h3>Evidence you can verify</h3>
          <p>Trace every conclusion to the comments and conversations behind it.</p>
        </article>
        <article>
          <span className="feature-icon">
            <Zap size={18} />
          </span>
          <h3>Answers in seconds</h3>
          <p>Give every team fast, dependable insight without waiting for manual analysis.</p>
        </article>
      </div>
    </section>
  );
}

function IntelligenceSection() {
  return (
    <section className="intelligence-section" id="how-it-works">
      <div className="section-shell intelligence-inner">
        <div className="center-intro">
          <p className="eyebrow light">AI technology</p>
          <h2>Purpose-built for the messy reality of human feedback</h2>
          <p>
            FeedSense combines language intelligence with transparent analytics to turn scattered
            comments into a decision-ready view of what matters.
          </p>
        </div>
        <div className="pipeline">
          <div className="pipeline-column inputs">
            <span>Surveys</span>
            <span>Reviews</span>
            <span>Tickets</span>
            <span>Comments</span>
          </div>
          <div className="pipeline-lines left-lines" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </div>
          <div className="pipeline-core">
            <div className="core-top">
              <span className="mini-brand dark">
                <span />
                <span />
                <span />
              </span>
              <span>FeedSense intelligence engine</span>
            </div>
            <div className="engine-block active">
              <Sparkles size={17} />
              <div>
                <strong>Language understanding</strong>
                <span>Sentiment · intent · nuance</span>
              </div>
            </div>
            <div className="engine-block">
              <Tags size={17} />
              <div>
                <strong>Theme discovery</strong>
                <span>Topics · tags · emerging issues</span>
              </div>
            </div>
            <div className="engine-block">
              <TrendingUp size={17} />
              <div>
                <strong>Impact modelling</strong>
                <span>Drivers · trends · opportunities</span>
              </div>
            </div>
          </div>
          <div className="pipeline-lines right-lines" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <div className="pipeline-column outputs">
            <span>Dashboard</span>
            <span>Alerts</span>
            <span>Reports</span>
          </div>
        </div>
        <div className="dark-features">
          <article>
            <span>01</span>
            <h3>Reads feedback in context</h3>
            <p>Understands phrases, qualifiers, and domain language as people actually use them.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Finds patterns at any scale</h3>
            <p>Groups related themes and tracks how their volume and sentiment change over time.</p>
          </article>
          <article>
            <span>03</span>
            <h3>Keeps humans in control</h3>
            <p>Makes the original feedback visible so every insight can be challenged and trusted.</p>
          </article>
        </div>
      </div>
    </section>
  );
}

function SolutionsSection() {
  return (
    <section className="section-shell solutions-section" id="solutions">
      <div className="section-intro">
        <div>
          <p className="eyebrow">Built for every feedback-rich team</p>
          <h2>One intelligence layer, shaped to your world</h2>
        </div>
        <p>
          Start with the feedback you already collect. FeedSense adapts its topics and reporting to
          your organisation, audience, and decisions.
        </p>
      </div>
      <div className="use-case-grid">
        {useCases.map(({ icon: Icon, title, text }, index) => (
          <article key={title} className="use-case-card">
            <div className="case-top">
              <span className="case-number">0{index + 1}</span>
              <span className="case-icon">
                <Icon size={20} />
              </span>
            </div>
            <h3>{title}</h3>
            <p>{text}</p>
            <a href="#dashboard">
              See sample dashboard <ArrowRight size={14} />
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}

function WorkflowSection() {
  const steps = [
    {
      number: "01",
      icon: Upload,
      title: "Bring feedback together",
      text: "Upload a file or connect the channels where people already share their experience.",
    },
    {
      number: "02",
      icon: Sparkles,
      title: "Let AI structure every signal",
      text: "Sentiment, topics, tags, and context are applied consistently across every comment.",
    },
    {
      number: "03",
      icon: TrendingUp,
      title: "See what is changing",
      text: "Explore trends, compare groups, and spot emerging issues before they become obvious.",
    },
    {
      number: "04",
      icon: Check,
      title: "Act with confidence",
      text: "Share the evidence, assign priorities, and measure whether your decisions made a difference.",
    },
  ];
  return (
    <section className="workflow-section" id="resources">
      <div className="section-shell">
        <div className="center-intro compact">
          <p className="eyebrow">From comments to clarity</p>
          <h2>A simpler way to understand what people need</h2>
        </div>
        <div className="workflow-grid">
          {steps.map(({ number, icon: Icon, title, text }) => (
            <article key={number}>
              <span className="workflow-number">{number}</span>
              <div className="workflow-icon">
                <Icon size={19} />
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonial() {
  return (
    <section className="testimonial-section">
      <div className="section-shell testimonial-grid">
        <blockquote>
          “We no longer debate which customer issues are loudest. We can see what matters, who it
          affects, and the evidence behind it in one place.”
        </blockquote>
        <div className="testimonial-person">
          <div className="person-avatar">ND</div>
          <div>
            <strong>Nadia Desai</strong>
            <span>Head of Customer Experience, Northstar</span>
          </div>
        </div>
        <div className="testimonial-result">
          <strong>3.4×</strong>
          <span>faster insight-to-action time</span>
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);
  return (
    <section className="section-shell faq-section">
      <div className="faq-title">
        <p className="eyebrow">Frequently asked questions</p>
        <h2>Everything you need to know</h2>
      </div>
      <div className="faq-list">
        {faqs.map(([question, answer], index) => {
          const isOpen = openIndex === index;
          return (
            <article className={isOpen ? "faq-item open" : "faq-item"} key={question}>
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? -1 : index)}
                aria-expanded={isOpen}
              >
                <span>{question}</span>
                {isOpen ? <Minus size={19} /> : <span className="plus">+</span>}
              </button>
              <div className="faq-answer">
                <p>{answer}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function CtaSection({ onAnalyze }) {
  return (
    <section className="cta-section">
      <div className="cta-ambient ambient-one" />
      <div className="cta-ambient ambient-two" />
      <div className="section-shell cta-inner">
        <p className="eyebrow">Hear what matters</p>
        <h2>Turn unread feedback into your clearest next decision</h2>
        <p>
          See how FeedSense can give every team a shared, evidence-backed understanding of the
          people they serve.
        </p>
        <div className="cta-actions">
          <a
            className="primary-button dark"
            href="/analyze"
            onClick={(event) => {
              event.preventDefault();
              onAnalyze();
            }}
          >
            Analyze feedback <ArrowRight size={15} />
          </a>
          <a className="outline-button" href="#platform">
            View sample insights
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="section-shell">
        <div className="footer-top">
          <div className="footer-brand">
            <Logo />
            <p>AI-powered feedback intelligence for teams that want to listen at scale.</p>
          </div>
          <div className="footer-links">
            <div>
              <strong>Platform</strong>
              <a href="#dashboard">Overview</a>
              <a href="#platform">Ask FeedSense</a>
              <a href="#how-it-works">AI intelligence</a>
              <a href="#dashboard">Reports</a>
            </div>
            <div>
              <strong>Solutions</strong>
              <a href="#solutions">Education</a>
              <a href="#solutions">Healthcare</a>
              <a href="#solutions">Retail</a>
              <a href="#solutions">Startups</a>
            </div>
            <div>
              <strong>Company</strong>
              <a href="#top">About</a>
              <a href="#resources">Resources</a>
              <a href="#top">Security</a>
              <a href="#top">Contact</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 FeedSense Intelligence Ltd.</span>
          <div>
            <a href="#top">Privacy</a>
            <a href="#top">Terms</a>
            <a href="#top">Accessibility</a>
          </div>
          <span className="footer-status">
            <i /> All systems operational
          </span>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage({ onAnalyze }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [period, setPeriod] = useState("Last 30 days");
  const [sentiment, setSentiment] = useState("All");

  const currentSummary = useMemo(() => dashboardViews[period], [period]);

  return (
    <>
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} onAnalyze={onAnalyze} />
      <main id="top">
        <section className="hero">
          <div className="hero-ambient" />
          <div className="section-shell hero-shell">
            <p className="eyebrow hero-eyebrow">AI-native feedback intelligence</p>
            <div className="hero-copy-grid">
              <div>
                <h1>Turn every comment into a decision.</h1>
                <a
                  className="primary-button"
                  href="/analyze"
                  onClick={(event) => {
                    event.preventDefault();
                    onAnalyze();
                  }}
                >
                  Analyze feedback <ArrowRight size={15} />
                </a>
              </div>
              <div className="hero-support">
                <p>
                  FeedSense reads every review, survey, ticket, and comment — then shows you how
                  people feel, what they care about, and what changed.
                </p>
                <div className="hero-proof">
                  <span>
                    <strong>{currentSummary.total}</strong> signals analysed
                  </span>
                  <span>
                    <strong>91%</strong> insight confidence
                  </span>
                </div>
              </div>
            </div>
            <Dashboard
              period={period}
              setPeriod={setPeriod}
              sentiment={sentiment}
              setSentiment={setSentiment}
            />
          </div>
        </section>
        <SourceStrip />
        <AskSection />
        <IntelligenceSection />
        <SolutionsSection />
        <WorkflowSection />
        <Testimonial />
        <FaqSection />
        <CtaSection onAnalyze={onAnalyze} />
      </main>
      <Footer />
    </>
  );
}
