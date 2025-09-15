import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SendIcon, LoaderIcon } from './Icons';

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
        <div className="bg-white border-t p-4 shrink-0">
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

export default MessageInput;