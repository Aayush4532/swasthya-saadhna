"use client";
import React, { useState, useRef, useEffect } from "react";
import { UserButton } from "@clerk/nextjs";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Escape regex characters for search highlighting
const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export default function SaadhoChatPage() {
  // 50 Zen & Buddhist–inspired Hindi quotes
  const quotes = [
    /* ... your quotes array as before ... */
  ];

  const getRandomQuote = () =>
    quotes[Math.floor(Math.random() * quotes.length)];

  // Initial state from localStorage
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("saadho-chat-history");
    if (saved) {
      return JSON.parse(saved);
    } else {
      const welcome = "नमस्ते! मैं Saadho AI हूँ—कैसे मदद कर सकता हूँ?";
      const quote = getRandomQuote();
      const timestamp = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      return [{ from: "ai", text: `${welcome}\n\n“${quote}”`, timestamp }];
    }
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const endRef = useRef(null);
  const recognitionRef = useRef(null);

  // Save messages to localStorage
  useEffect(() => {
    localStorage.setItem("saadho-chat-history", JSON.stringify(messages));
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'hi-IN';

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join('');
        setInput(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Scroll to bottom
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleSend = async () => {
    if (loading || !input.trim()) return;
    setLoading(true);

    const now = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    setMessages((m) => [...m, { from: "user", text: input.trim(), timestamp: now }]);
    const query = input.trim();
    setInput("");

    // Add typing indicator
    setMessages((m) => [...m, { from: "typing", text: "", timestamp: "" }]);

    try {
      const res = await fetch("/api/config/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!res.ok) throw new Error("Server error");

      const data = await res.json();
      const replyTime = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      // Remove typing and add AI reply
      setMessages((m) =>
        m.filter((msg) => msg.from !== "typing").concat({ from: "ai", text: data.reply, timestamp: replyTime })
      );
    } catch (e) {
      console.error("Chat error:", e);
      const errTime = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      setMessages((m) =>
        m.filter((msg) => msg.from !== "typing").concat({ from: "ai", text: "क्षमा करें, कुछ त्रुटि हुई। कृपया पुनः प्रयास करें।", timestamp: errTime })
      );
    } finally {
      setLoading(false);
    }
  };

  const onKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    const welcome = "नमस्ते! मैं Saadho AI हूँ—कैसे मदद कर सकता हूँ?";
    const quote = getRandomQuote();
    const timestamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    setMessages([{ from: "ai", text: `${welcome}\n\n“${quote}”`, timestamp }]);
    localStorage.removeItem("saadho-chat-history");
  };

  const exportChat = () => {
    const chatText = messages
      .filter(msg => msg.from !== 'typing')
      .map(msg => {
        const prefix = msg.from === 'user' ? 'आप: ' : 'Saadho: ';
        return `${prefix}${msg.text}\n[${msg.timestamp}]`;
      })
      .join('\n\n');

    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `saadho-chat-${new Date().toISOString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const highlightText = (text, query) => {
    if (!query) return text;
    const escapedQuery = escapeRegExp(query);
    const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase()
        ? <mark key={index} className="bg-yellow-500 text-black">{part}</mark>
        : part
    );
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-gradient-to-br from-[#05070a] via-[#0b0e17] to-black text-white">
      {/* Scrollbar styling */}
      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #0b0e17;
        }
        ::-webkit-scrollbar-thumb {
          background-color: #4b5563;
          border-radius: 10px;
          border: 2px solid #0b0e17;
        }
      `}</style>

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-black bg-opacity-50 backdrop-blur-md">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-sky-400">Swasthya Saadho AI</h1>
          <button 
            onClick={clearChat}
            className="px-3 py-1 text-xs bg-red-700 hover:bg-red-800 rounded-lg transition"
            title="Clear chat history"
          >
            नया चैट
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="संदेश खोजें..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-40 px-4 py-2 bg-[#1a1d25] text-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
          <button 
            onClick={exportChat}
            className="px-3 py-1 text-xs bg-green-700 hover:bg-green-800 rounded-lg transition"
            title="Export chat"
          >
            निर्यात करें
          </button>
          <UserButton />
        </div>
      </header>

      {/* Chat messages */}
      <main className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, i) => {
          const isUser = msg.from === "user";
          const isTyping = msg.from === "typing";
          
          return (
            <div key={i} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>              
              <div className="flex flex-col max-w-[80%]">
                <div className={
                        `
                          relative px-5 py-3 rounded-2xl shadow-xl
                          ${isUser
                            ? "self-end bg-gradient-to-br from-[#0077E5] to-[#0A5EBD] text-white rounded-br-none"
                            : isTyping
                            ? "self-start bg-[#1a1d25] text-gray-400 italic"
                            : "self-start bg-[#1a1d25] text-gray-200 rounded-bl-none"}
                          backdrop-blur-sm
                          transition-all`
                }>  
                  {isTyping ? (
                    <span className="animate-pulse">Saadho टाइप कर रहा है...</span>
                  ) : isUser ? (
                    <span>{highlightText(msg.text, searchQuery)}</span>
                  ) : (
                    <div className="prose prose-invert max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
                {!isTyping && (
                  <span className={`text-xs text-gray-400 mt-1 ${isUser ? "text-right" : "text-left"}`}>
                    {msg.timestamp}
                  </span>
                )}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </main>

      {/* Input */}
      <footer className="flex items-center p-4 bg-[#12141a] border-t border-[#2a2d35]">
        <button
          onClick={isListening ? stopListening : startListening}
          disabled={loading}
          className={`p-2 mr-2 rounded-full ${
            isListening 
              ? "animate-pulse bg-red-500" 
              : "bg-[#1a1d25] hover:bg-[#2a2d35]"
          } transition`}          title={isListening ? "सुनना बंद करें" : "वॉइस इनपुट"}
        >
          {isListening ? (
            <span className="w-5 h-5 block bg-white rounded-full"></span>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
          )}
        </button>
        
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={onKeyPress}
          disabled={loading}
          placeholder="अपना संदेश टाइप करें..."
          className="flex-1 resize-none rounded-xl bg-[#1a1d25] text-gray-200 placeholder-gray-500 px-4 py-2 mr-3 focus:outline-none focus:ring-2 focus:ring-sky-500 transition min-h-[44px] max-h-32"
        />
        
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="px-6 py-2 rounded-xl font-semibold bg-gradient-to-r from-[#0084FF] to-[#0066CC] hover:from-[#0095FF] hover:to-[#0077E5] transition disabled:opacity-50"
        >
          {loading ? (
            <div className="flex items-center">
              <span className="w-3 h-3 border-t-2 border-r-2 border-white rounded-full animate-spin mr-2" />
              भेज रहे हैं...
            </div>
          ) : (
            "भेजें"
          )}
        </button>
      </footer>
    </div>
  );
}