import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloseIcon } from './Icons';

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

    const formatList = (text = '') => (text || '').split('\n').map((item, i) =>
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

export default ReportModal;