import { useState } from "react";
import { ChatSidebar } from "./ChatSidebar";
import { ChatView } from "./ChatView";
import { Share2 } from "lucide-react";
import "./ChatLayout.css";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  type?: "text" | "diagnosis" | "results";
  diagnosis?: {
    persona: string;
    task: string;
    successCriteria: string;
  };
  tools?: Array<{
    id: string;
    name: string;
    rank: number;
    description: string;
    usefulness: number;
    relevance: number;
    reliability: number;
    tradeoff: string;
    guidance: string;
    url: string;
  }>;
}

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  date: string;
}

export function ChatLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatPhase, setChatPhase] = useState<
    "idle" | "searching" | "diagnosis" | "results"
  >("idle");
  const [currentDiagnosis, setCurrentDiagnosis] = useState<
    ChatMessage["diagnosis"] | null
  >(null);

  const [chatHistory] = useState<ChatSession[]>([
    {
      id: "1",
      title: "AI tools for social media",
      lastMessage: "Here are 5 tools curated for you...",
      date: "Today",
    },
    {
      id: "2",
      title: "Podcast audio cleanup",
      lastMessage: "Based on your needs, I recommend...",
      date: "Yesterday",
    },
    {
      id: "3",
      title: "Code review assistants",
      lastMessage: "For your backend workflow...",
      date: "Feb 21",
    },
  ]);

  const handleSend = (text: string) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      type: "text",
    };
    setMessages((prev) => [...prev, userMsg]);
    setChatPhase("searching");

    // Simulate AI diagnosis after a short delay
    setTimeout(() => {
      const diagnosis = {
        persona: "Creative Professional",
        task: text.length > 60 ? text.substring(0, 57) + "..." : text,
        successCriteria:
          "Must be user-friendly, reliable, and fit existing workflow.",
      };
      setCurrentDiagnosis(diagnosis);

      const diagMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I've analyzed your request. Here's what I understand:",
        type: "diagnosis",
        diagnosis,
      };
      setMessages((prev) => [...prev, diagMsg]);
      setChatPhase("diagnosis");
    }, 1200);
  };

  const handleConfirmDiagnosis = () => {
    const confirmMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: "Yes, that's correct. Please find tools for me.",
      type: "text",
    };
    setMessages((prev) => [...prev, confirmMsg]);
    setChatPhase("searching");

    // Simulate results
    setTimeout(() => {
      const MOCK_TOOLS = [
        {
          id: "1",
          name: "Copy.ai",
          rank: 1,
          description:
            "Advanced AI copywriting tool with specific templates for every marketing use case.",
          usefulness: 98,
          relevance: 95,
          reliability: 92,
          tradeoff: "Can sometimes feel overwhelming with too many options.",
          guidance:
            'Start with the "Social Media Post" template for best results.',
          url: "https://copy.ai",
        },
        {
          id: "2",
          name: "Jasper",
          rank: 2,
          description:
            "Enterprise-grade content platform that helps teams stay on brand across all channels.",
          usefulness: 94,
          relevance: 91,
          reliability: 95,
          tradeoff: "More expensive than other tools on this list.",
          guidance:
            'Use the "Brand Voice" feature to upload your existing content.',
          url: "https://jasper.ai",
        },
        {
          id: "3",
          name: "Writesonic",
          rank: 3,
          description:
            "SEO-optimized content generator that excels at long-form articles and ad copies.",
          usefulness: 89,
          relevance: 88,
          reliability: 90,
          tradeoff: "Output quality can vary depending on prompt specificity.",
          guidance: 'Use "Photosonic" integration for matching images.',
          url: "https://writesonic.com",
        },
        {
          id: "4",
          name: "Anyword",
          rank: 4,
          description:
            "Data-driven copywriting platform that predicts how your audience will react.",
          usefulness: 85,
          relevance: 84,
          reliability: 88,
          tradeoff: "Focuses more on performance than creative flair.",
          guidance: 'Pay attention to the "Predictive Performance Score".',
          url: "https://anyword.com",
        },
        {
          id: "5",
          name: "Rytr",
          rank: 5,
          description:
            "Simple, fast, and affordable AI writing assistant for everyday tasks.",
          usefulness: 80,
          relevance: 78,
          reliability: 85,
          tradeoff: "Lacks advanced collaboration features.",
          guidance: "The mobile app is great for drafting copies on the go.",
          url: "https://rytr.me",
        },
      ];

      const resultsMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Here are 5 tools I've curated for you based on your request. Each tool is ranked by usefulness, relevance, and reliability:`,
        type: "results",
        tools: MOCK_TOOLS,
      };
      setMessages((prev) => [...prev, resultsMsg]);
      setChatPhase("results");
    }, 1500);
  };

  const handleNewChat = () => {
    setMessages([]);
    setChatPhase("idle");
    setCurrentDiagnosis(null);
  };

  return (
    <div className="chat-layout">
      {/* Share button */}
      <button className="chat-share-btn" title="Share conversation">
        <Share2 size={16} />
        <span>Share</span>
      </button>

      <ChatSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onNewChat={handleNewChat}
        chatHistory={chatHistory}
      />

      <ChatView
        messages={messages}
        onSend={handleSend}
        chatPhase={chatPhase}
        onConfirmDiagnosis={handleConfirmDiagnosis}
        sidebarOpen={sidebarOpen}
      />
    </div>
  );
}
