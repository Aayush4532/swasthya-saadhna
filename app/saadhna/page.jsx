"use client";
import React, { useState, useRef, useEffect } from 'react';

export default function ChatBox() {
  const [messages, setMessages] = useState([
    { 
      from: 'ai', 
      text: 'Namaste! How can I assist you today?', 
      timestamp: '10:00' 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (loading || !input.trim()) return;
    setLoading(true);
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { from: 'user', text: input.trim(), timestamp: time };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    setTimeout(() => {
      const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const aiMsg = { from: 'ai', text: 'This is a placeholder reply from AI.', timestamp: replyTime };
      setMessages(prev => [...prev, aiMsg]);
      setLoading(false);
    }, 800);
  };

  const onKeyPress = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-gradient-to-br from-[#05070a] via-[#0b0e17] to-black p-4">
      {/* Message container with custom scrollbar */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto mb-4 pb-2 your-scrollable-div"
        style={{ 
          scrollbarWidth: 'thin',
          scrollbarColor: '#1A2B3C #000319'
        }}
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex mb-3 ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className="flex flex-col max-w-[85%]">
              <div
                className={`relative p-4 rounded-2xl whitespace-pre-wrap text-sm shadow-lg
                  ${msg.from === 'user'
                    ? 'bg-gradient-to-br from-[#0077E5] to-[#0A5EBD] text-white rounded-br-none'
                    : 'bg-[#1a1d25] text-gray-200 rounded-bl-none'}`
                }
              >
                <div className="break-words">{msg.text}</div>
              </div>
              <span className={`text-[10px] text-gray-400 mt-1 ${msg.from === 'user' ? 'text-right pr-1' : 'text-left pl-1'}`}>
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Input area */}
      <div className="flex items-center bg-[#12141a] rounded-xl p-3 border border-[#2a2d35]">
        <textarea
          className="flex-1 resize-none rounded-xl bg-[#1a1d25] text-gray-200 placeholder-gray-500 p-3 mr-3 focus:outline-none focus:ring-1 focus:ring-[#0084FF]/50 transition-all"
          rows={1}
          value={input}
          placeholder="Type a message..."
          onChange={e => setInput(e.target.value)}
          onKeyPress={onKeyPress}
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="px-6 py-2.5 bg-gradient-to-r from-[#0084FF] to-[#0066CC] rounded-xl text-white font-medium hover:from-[#0095FF] hover:to-[#0077E5] focus:outline-none focus:ring-2 focus:ring-[#0084FF]/50 transition-all disabled:opacity-50 flex-shrink-0"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="w-3 h-3 border-t-2 border-r-2 border-white rounded-full animate-spin mr-1"></div>
              Sending
            </div>
          ) : 'Send'}
        </button>
      </div>

      {/* Ensure custom scrollbar styles are applied */}
      <style jsx global>{`
        .your-scrollable-div::-webkit-scrollbar {
          width: 9px;
          height: 6px;
        }
        .your-scrollable-div::-webkit-scrollbar-track {
          background: #000319;
          border-radius: 10px;
        }
        .your-scrollable-div::-webkit-scrollbar-thumb {
          background-color: #1A2B3C;
          border-radius: 10px;
          border: 1px solid #000000;
        }
        .your-scrollable-div::-webkit-scrollbar-thumb:hover {
          background-color: #2F4F6F;
        }
      `}</style>
    </div>
  );
}