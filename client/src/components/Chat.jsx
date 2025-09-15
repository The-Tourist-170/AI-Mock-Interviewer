import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

import { apiService } from '../utils/ApiService';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ReportModal from './ReportModal';

const Chat = () => {
    const [sessionId, setSessionId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [report, setReport] = useState(null);
    const [isInterviewOver, setIsInterviewOver] = useState(false);

    useEffect(() => {
        const initializeChat = async () => {
            try {
                const data = await apiService.startInterview();
                setSessionId(data.id);
                const welcomeMessage = `Hello and welcome!

My name is Alex, and I'll be your AI interviewer for this session. My purpose is to help assess your skills and understanding of Microsoft Excel.

I will ask you a series of questions that will progress in difficulty. Please take your time to think through your answers. There's no need to rush.

When you are ready to begin the interview, simply type "Start".`;

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

        const userMessage = { content: userInput, sender: 'USER' };
        setMessages((prevMessages) => [...prevMessages, userMessage]);
        setIsLoading(true);

        try {
            const aiResponse = await apiService.sendMessage(sessionId, userInput);
            const res = { content: aiResponse.message, sender: 'AI' }
            setMessages((prevMessages) => [...prevMessages, res]);

            if (res?.content?.toLowerCase().includes("that concludes our interview")) {
                setIsInterviewOver(true);
            }
        } catch (error) {
            console.error("Failed to send message:", error);
            setMessages((prevMessages) => [...prevMessages, { content: 'There was an error processing your message. Please try again.', sender: 'AI' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const parseReportText = (report) => {
        return {
            overallScore: report.overallScore,
            strengths: report.strengths,
            weaknesses: report.weaknesses,
            suggestionsForImprovement: report.suggestionsForImprovement
        };
    };

    const handleGetReport = async () => {
        if (!sessionId) return;
        setIsLoading(true);
        try {
            const report = await apiService.getReport(sessionId);
            const parsedReport = parseReportText(report);
            setReport(parsedReport);
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

export default Chat;