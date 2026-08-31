import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Mic, MicOff, Volume2, VolumeX, Send, Loader2, MessageSquare, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

const AIAssistantWidget = () => {
  const { t, currentLangObj, speechLang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize Web Speech API for Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = speechLang;

      rec.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setQuery(transcript);
      };

      rec.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, [speechLang]);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          sender: 'ai',
          text: `${t('welcomeMessage')} (${currentLangObj.native})`
        }
      ]);
    }
  }, [currentLangObj]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang = speechLang;
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Mic start error', err);
        setIsListening(false);
      }
    }
  };

  const speakText = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = speechLang;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    const userPrompt = query.trim();
    if (!userPrompt || loading) return;

    // Add user message
    const newMsgs = [...messages, { sender: 'user', text: userPrompt }];
    setMessages(newMsgs);
    setQuery('');
    setLoading(true);

    try {
      const res = await api.post('/services/chat', {
        question: userPrompt,
        language: currentLangObj.name
      });

      const aiAnswer = res.data.answer || 'Thank you for your question. You can explore destinations and book local guides on our platform.';
      setMessages(prev => [...prev, { sender: 'ai', text: aiAnswer }]);

      if (ttsEnabled) {
        speakText(aiAnswer);
      }
    } catch (err) {
      console.error('AI chat error:', err);
      setMessages(prev => [
        ...prev,
        { sender: 'ai', text: 'Apologies, I encountered an issue connecting to the server. Please try again.' }
      ]);
    }
    setLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-4 rounded-full shadow-2xl flex items-center gap-2 font-bold transition-all transform hover:scale-105 group border-2 border-white/40"
          title="Open Smart AI Assistant"
        >
          <div className="relative">
            <Bot className="w-7 h-7 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <span className="hidden sm:inline text-sm pr-1">AI Assistant</span>
        </button>
      )}

      {/* AI Assistant Chat Drawer Overlay */}
      {isOpen && (
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-[90vw] sm:w-[380px] h-[520px] flex flex-col overflow-hidden animate-fade-in">
          
          {/* Drawer Header */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-4 flex justify-between items-center shadow-md">
            <div className="flex items-center space-x-2.5">
              <div className="bg-blue-500/20 p-2 rounded-xl border border-blue-400/30">
                <Bot className="w-6 h-6 text-blue-300" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm leading-snug flex items-center gap-1.5">
                  {t('aiTitle')} <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                </h3>
                <p className="text-[11px] text-blue-200 opacity-90">🌐 Language: <b>{currentLangObj.native}</b></p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  if (isSpeaking) stopSpeaking();
                  setTtsEnabled(!ttsEnabled);
                }}
                className={`p-1.5 rounded-lg text-xs transition ${
                  ttsEnabled ? 'bg-blue-500/30 text-blue-200 hover:bg-blue-500/40' : 'bg-gray-700/50 text-gray-400'
                }`}
                title={ttsEnabled ? 'Voice Output ON' : 'Voice Output OFF'}
              >
                {ttsEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                onClick={() => {
                  stopSpeaking();
                  setIsOpen(false);
                }}
                className="hover:bg-white/20 p-1.5 rounded-lg text-gray-300 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-gray-50/50 text-xs">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[82%] p-3 rounded-2xl shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 text-gray-600 p-3 rounded-2xl flex items-center space-x-2 text-xs shadow-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span>AI Assistant is thinking...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Speech Active Bar */}
          {isListening && (
            <div className="bg-blue-50 border-t border-blue-200 p-2 text-center text-xs font-bold text-blue-700 flex items-center justify-center gap-2 animate-pulse">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
              <span>{t('listening')}</span>
            </div>
          )}

          {/* Chat Input Controls */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                className="flex-1 bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder={t('askAI')}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />

              {/* Microphone Speech Recognition Button */}
              <button
                type="button"
                onClick={toggleListening}
                className={`p-2.5 rounded-xl transition text-white flex-shrink-0 ${
                  isListening ? 'bg-red-600 hover:bg-red-700 animate-pulse' : 'bg-slate-700 hover:bg-slate-800'
                }`}
                title={t('micPrompt')}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Send/Search Button */}
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-2.5 rounded-xl transition flex-shrink-0 flex items-center justify-center"
                title={t('searchSend')}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            <div className="flex justify-between items-center text-[10px] text-gray-400 px-1 pt-0.5">
              <span>🎤 Speech recognition & 🔊 Voice output enabled</span>
              {isSpeaking && (
                <button
                  type="button"
                  onClick={stopSpeaking}
                  className="text-red-500 font-bold hover:underline"
                >
                  ⏹ Stop Speaking
                </button>
              )}
            </div>
          </form>

        </div>
      )}
    </div>
  );
};

export default AIAssistantWidget;
