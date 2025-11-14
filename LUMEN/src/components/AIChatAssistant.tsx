import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { chatService } from '../services/api';

const suggestedQuestions = [
  'Show me my grocery expenses',
  'What did I spend on food this month?',
  'Tell me about my recent purchases',
  'Show me all my transport expenses',
];

interface Message {
  role: 'user' | 'assistant';
  content: string;
  transactions?: any[];
}

export default function AIChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hi! I\'m your LUMEN AI assistant. Ask me anything about your transactions and finances!',
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Create chat session when component opens
  useEffect(() => {
    if (isOpen && !sessionId) {
      createSession();
    }
  }, [isOpen]);

  const createSession = async () => {
    try {
      const result = await chatService.createSession();
      if (result.success && result.data?.session_id) {
        setSessionId(result.data.session_id);
      }
    } catch (err) {
      console.error('Failed to create chat session:', err);
    }
  };

  const handleSend = async (message?: string) => {
    const text = message || input;
    if (!text.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setInput('');
    setIsTyping(true);
    setError(null);

    try {
      // Send message to RAG API
      const result = await chatService.sendMessage(text, sessionId || undefined);
      
      console.log('RAG API Response:', result); // Debug log
      
      if (result.success && result.data) {
        // Update session ID if returned
        if (result.data.session_id && !sessionId) {
          setSessionId(result.data.session_id);
        }

        // Add AI response
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: result.data.response || 'I apologize, I couldn\'t process that request.',
            transactions: result.data.retrieved_docs || [],
          },
        ]);
      } else {
        const errorMsg = result.error || 'Failed to get response';
        console.error('API Error:', errorMsg);
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      console.error('Chat error details:', err);
      const errorMessage = err.message || 'Unknown error';
      setError(`Error: ${errorMessage}. Please make sure you're logged in.`);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `I'm sorry, I encountered an error: ${errorMessage}. Please make sure you're logged in and try again.`,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            onClick={() => setIsOpen(true)}
            aria-label="Open assistant"
            title="Open assistant"
            className="fixed bottom-6 right-6 w-16 h-16 bg-cyan hover:bg-cyan-dark text-black rounded-full shadow-lg flex items-center justify-center z-50 glow-cyan"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <MessageCircle className="w-8 h-8" />
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            
            {/* Chat Window - Centered */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', bounce: 0.3 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-2xl h-[80vh] max-h-[700px] glass-card rounded-2xl shadow-2xl flex flex-col z-50"
            >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-cyan/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-cyan" />
                </div>
                <div>
                  <h3 className="font-bold">LUMEN Assistant</h3>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse-soft"></div>
                    <span className="text-xs text-text-secondary">Online</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close assistant"
                title="Close assistant"
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-cyan text-black'
                        : 'bg-white/10 text-white'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    {message.transactions && message.transactions.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs text-cyan font-semibold flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Related Transactions
                        </p>
                        {message.transactions.slice(0, 3).map((tx: any, idx: number) => (
                          <div key={idx} className="bg-black/30 rounded p-2 text-xs">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold text-white">{tx.merchant}</p>
                                <p className="text-text-secondary">{tx.category}</p>
                              </div>
                              <p className="font-bold text-cyan">₹{tx.amount}</p>
                            </div>
                            <p className="text-text-secondary mt-1">{new Date(tx.date).toLocaleDateString()}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-white/10 p-3 rounded-lg">
                    <div className="flex gap-1">
                      <motion.div
                        className="w-2 h-2 bg-cyan rounded-full"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-cyan rounded-full"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-cyan rounded-full"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {messages.length === 1 && (
                <div className="space-y-2">
                  <p className="text-sm text-text-secondary">Try asking:</p>
                  {suggestedQuestions.map((question, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleSend(question)}
                      className="w-full text-left p-3 glass-card hover:bg-white/10 rounded-lg text-sm transition-all"
                    >
                      • {question}
                    </motion.button>
                  ))}
                </div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/20 border border-red-500/50 rounded-lg p-3"
                >
                  <p className="text-sm text-red-400">{error}</p>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your question..."
                  className="flex-1 px-4 py-2 bg-bg-tertiary border border-white/10 rounded-lg focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20 transition-all text-sm"
                />
                <button
                  type="submit"
                  aria-label="Send message"
                  title="Send message"
                  disabled={!input.trim()}
                  className="px-4 py-2 bg-cyan hover:bg-cyan-dark text-black rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
