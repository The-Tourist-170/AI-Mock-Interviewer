import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- SVG Icons (Self-contained, no extra libraries needed) ---
const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 2 11 13" /><path d="m22 2-7 20-4-9-9-4 20-7z" />
  </svg>
);

const LoaderIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);


// --- API Service Functions ---
const API_BASE_URL = 'http://localhost:8080/api/v1'; // Adjust if your backend is elsewhere

const apiService = {
  startInterview: async () => {
    const response = await fetch(`${API_BASE_URL}/interviews`, { method: 'POST' });
    if (!response.ok) throw new Error('Failed to start interview');
    return response.json();
  },
  sendMessage: async (id, message) => {
    const response = await fetch(`${API_BASE_URL}/interviews/${id}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: message, sender: 'USER' }),
    });
    if (!response.ok) throw new Error('Failed to send message');
    return response.json();
  },
  getReport: async (id) => {
    const response = await fetch(`${API_BASE_URL}/interviews/${id}/report`);
    if (!response.ok) throw new Error('Failed to get report');
    return response.json();
  },
};


// --- UI Components ---

const ReportModal = ({ report, onClose }) => {
  if (!report) return null;

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 30 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    exit: { opacity: 0, scale: 0.9, y: 30 },
  };

  const formatList = (text) => text.split('\n').map((item, i) =>
    item.trim().startsWith('-') ? <li key={i} className="mt-1">{item.substring(1).trim()}</li> : null
  ).filter(Boolean);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto p-8"
          variants={modalVariants}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Interview Report</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors">
              <CloseIcon />
            </button>
          </div>
          <div className="space-y-6 text-gray-700">
            <div>
              <h3 className="text-xl font-semibold text-blue-600 mb-2">Overall Score</h3>
              <p className="text-5xl font-bold text-gray-900">{report.overallScore}<span className="text-3xl text-gray-500">/10</span></p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-green-600 mb-2">Strengths</h3>
              <ul className="list-disc list-inside space-y-1">{formatList(report.strengths)}</ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-red-600 mb-2">Areas for Improvement</h3>
              <ul className="list-disc list-inside space-y-1">{formatList(report.weaknesses)}</ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-purple-600 mb-2">Suggestions</h3>
              <ul className="list-disc list-inside space-y-1">{formatList(report.suggestionsForImprovement)}</ul>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const MessageInput = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="bg-white border-t p-4">
      <form onSubmit={handleSubmit} className="flex items-center space-x-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your answer here..."
          className="flex-grow px-4 py-3 text-gray-700 bg-gray-100 border border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200"
          disabled={isLoading}
        />
        <motion.button
          type="submit"
          disabled={isLoading}
          className="flex items-center justify-center w-12 h-12 rounded-full transition-colors duration-200 bg-blue-600 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
          whileHover={{ scale: isLoading ? 1 : 1.1 }}
          whileTap={{ scale: isLoading ? 1 : 0.95 }}
        >
          {isLoading ? <span className="animate-spin"><LoaderIcon /></span> : <SendIcon />}
        </motion.button>
      </form>
    </div>
  );
};

const MessageList = ({ messages, isLoading }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  return (
    <div ref={scrollRef} className="flex-grow p-6 overflow-y-auto">
      <AnimatePresence>
        {messages.map((msg, index) => (
          <motion.div
            key={index}
            variants={messageVariants}
            initial="hidden"
            animate="visible"
            layout
            className={`flex my-2.5 ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs md:max-w-md lg:max-w-2xl px-5 py-3 rounded-2xl shadow-sm ${msg.sender === 'USER'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white text-gray-800 rounded-bl-none'
                }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      {isLoading && messages.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-start"
        >
          <div className="px-4 py-3 bg-white rounded-2xl shadow-md rounded-bl-none">
            <div className="flex items-center justify-center space-x-2">
              <motion.div className="w-2 h-2 bg-gray-500 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }} />
              <motion.div className="w-2 h-2 bg-gray-500 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.9, delay: 0.15, repeat: Infinity, ease: "easeInOut" }} />
              <motion.div className="w-2 h-2 bg-gray-500 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.9, delay: 0.3, repeat: Infinity, ease: "easeInOut" }} />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// --- Main Chat Component ---

const Chat = () => {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [isInterviewOver, setIsInterviewOver] = useState(false);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        const { id, initialMessage } = await apiService.startInterview();
        setSessionId(id);
        const welcomeMessage = initialMessage || "Hello! I'm Alex. Ready to dive into some Excel questions? Let's start with your understanding of Pivot Tables. What are they used for?";
        setMessages([{ content: welcomeMessage, sender: 'AI' }]);
      } catch (error) {
        console.error("Failed to start interview:", error);
        setMessages([{ content: 'Sorry, I am unable to start the interview right now. Please refresh the page to try again.', sender: 'AI' }]);
      } finally {
        setIsLoading(false);
      }
    };
    initializeChat();
  }, []);

  const handleSendMessage = async (userInput) => {
    if (!sessionId || isInterviewOver) return;
    setMessages((prev) => [...prev, { content: userInput, sender: 'USER' }]);
    setIsLoading(true);

    try {
      const aiResponse = await apiService.sendMessage(sessionId, userInput);
      setMessages((prev) => [...prev, aiResponse]);
      if (aiResponse.content.toLowerCase().includes("thank you for your time")) {
        setIsInterviewOver(true);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages((prev) => [...prev, { content: 'There was an error processing your message. Please try again.', sender: 'AI' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetReport = async () => {
    if (!sessionId) return;
    setIsLoading(true);
    try {
      const reportData = await apiService.getReport(sessionId);
      setReport(reportData);
    } catch (error) {
      console.error("Failed to get report:", error);
      setMessages((prev) => [...prev, { content: 'Sorry, I could not generate the report at this time.', sender: 'AI' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[95vh] w-full max-w-3xl mx-auto bg-gray-100 shadow-2xl rounded-2xl my-4 overflow-hidden border border-gray-200">
      <header className="bg-white p-4 border-b text-center shrink-0">
        <h1 className="text-2xl font-bold text-gray-800">Excel Interview with Alex</h1>
        <p className="text-sm text-gray-500">AI-Powered Skill Assessment</p>
      </header>

      <MessageList messages={messages} isLoading={isLoading} />

      {isInterviewOver && !report && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-4 flex justify-center bg-white border-t">
          <button
            onClick={handleGetReport} disabled={isLoading}
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Generating Report...' : 'View My Performance Report'}
          </button>
        </motion.div>
      )}

      {!isInterviewOver && <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} />}

      {report && <ReportModal report={report} onClose={() => setReport(null)} />}
    </div>
  );
};


// --- App Root ---

function App() {
  return (
    <div className="w-full min-h-screen bg-gray-200 flex items-center justify-center p-4">
      <Chat />
    </div>
  );
}

export default App;