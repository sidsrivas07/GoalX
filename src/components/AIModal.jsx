import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2 } from 'lucide-react';
import { api } from '../api';
import './AIModal.css';

export default function AIModal({ isOpen, onClose, onPlanGenerated }) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorText, setErrorText] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setErrorText('');

    try {
      // Connect specifically to our Gemini-powered backend API
      const response = await api.post('/planner/generate', { prompt });
      
      console.log('AI Generation success', response);
      onPlanGenerated(); // The main app will refetch logic
      setPrompt('');
      onClose();
    } catch (err) {
      console.error('Failed to generate AI plan:', err);
      setErrorText('Error: AI failed to process request. Check API key or limit.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="ai-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />
          <motion.div
            className="ai-modal"
            initial={{ opacity: 0, y: 80, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 80, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="ai-modal-header">
              <div className="ai-modal-icon">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="ai-modal-title">AI Schedule Generator</h3>
                <p className="ai-modal-desc">Describe what you want to plan</p>
              </div>
            </div>

            <textarea
              className="ai-modal-input"
              placeholder="Describe your schedule (e.g., gym routine, study plan, daily habits…)"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={4}
              disabled={isGenerating}
              autoFocus
            />

            {errorText && (
              <div className="ai-modal-error" style={{ color: '#ef4444', fontSize: '13px', marginBottom: '12px' }}>
                {errorText}
              </div>
            )}

            <button
              className="ai-generate-btn"
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 size={18} className="spin-icon" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Generate Plan
                </>
              )}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
