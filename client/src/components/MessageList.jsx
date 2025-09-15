import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

export default MessageList;