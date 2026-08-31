import { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { Loader2, Compass, Sun, Moon, Sunrise, Mic, MicOff, Search, Volume2, VolumeX, Sparkles } from 'lucide-react';

const AIPlanner = () => {
  const { speechLang } = useLanguage();
  const [formData, setFormData] = useState({
    destination: '',
    days: 3,
    interest: 'Nature',
    budget: 'Medium',
    travelType: 'Family',
    language: 'English'
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [fallbackMsg, setFallbackMsg] = useState(null);
  
  // Voice input state
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState(null);
  const recognitionRef = useRef(null);

  // Text-to-Speech (Speaker) state
  const [isSpeakingPlan, setIsSpeakingPlan] = useState(false);

  // Web Audio API Chime Sound
  const playChimeSound = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now); // C5
      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.4);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(783.99, now + 0.15); // G5
      gain2.gain.setValueAtTime(0.2, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.7);
    } catch (e) {
      console.error("Chime error:", e);
    }
  };

  // Microphone Voice Search Handler
  const handleVoiceInput = () => {
    setVoiceError(null);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError('Voice input is not supported in this browser. Please type the city or place.');
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = speechLang || 'en-US';

      rec.onstart = () => setIsListening(true);
      rec.onend = () => setIsListening(false);

      rec.onresult = (event) => {
        const spokenText = event.results[0][0].transcript;
        if (spokenText) {
          setFormData(prev => ({ ...prev, destination: spokenText.replace(/\.$/, '') }));
        }
      };

      rec.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setVoiceError('Microphone permission was denied.');
        } else {
          setVoiceError('Voice recognition error. Please try typing.');
        }
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.error('Voice start error:', err);
      setIsListening(false);
      setVoiceError('Voice input is not supported in this browser. Please type the city or place.');
    }
  };

  // Speaker Text-to-Speech Readout Handler
  const handleSpeakItinerary = () => {
    if (!result || !('speechSynthesis' in window)) {
      alert('Voice readout is not supported by your browser.');
      return;
    }

    if (isSpeakingPlan) {
      window.speechSynthesis.cancel();
      setIsSpeakingPlan(false);
      return;
    }

    let textToSpeak = `Here is your travel itinerary for ${formData.destination || result.title}. `;
    
    result.itinerary?.forEach((day) => {
      textToSpeak += `Day ${day.day}. `;
      if (day.morning) textToSpeak += `Morning: ${day.morning.replace(/📍 Place: |🕒 Perfect Time: |🌲 Nature & View: /g, ' ')}. `;
      if (day.afternoon) textToSpeak += `Afternoon: ${day.afternoon.replace(/📍 Place: |🕒 Perfect Time: |🌲 Nature & View: /g, ' ')}. `;
      if (day.evening) textToSpeak += `Evening: ${day.evening.replace(/📍 Place: |🕒 Perfect Time: |🌲 Nature & View: /g, ' ')}. `;
    });

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = speechLang || 'en-US';
    utterance.rate = 0.95;

    utterance.onstart = () => setIsSpeakingPlan(true);
    utterance.onend = () => setIsSpeakingPlan(false);
    utterance.onerror = () => setIsSpeakingPlan(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFallbackMsg(null);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsSpeakingPlan(false);

    try {
      const res = await api.post('/services/itinerary', formData);
      setResult(res.data.data);
      if (res.data.data) {
        localStorage.setItem('currentItinerary', JSON.stringify(res.data.data));
        playChimeSound(); // Play audio chime sound when plan is revealed!
      }
      if (res.data.isFallback) setFallbackMsg(res.data.message);
    } catch (err) {
      setError('Failed to generate itinerary. Please try again.');
    }
    setLoading(false);
  };

  const renderSlot = (timeLabel, text, icon, colorBg) => {
    if (!text) return null;

    const cleanText = text.replace(/📍 Place: |🕒 Perfect Time: |🌲 Nature & View: /g, ' ');

    return (
      <div className={`p-4 rounded-xl border ${colorBg} space-y-2`}>
        <div className="flex justify-between items-start flex-wrap gap-2">
          <div className="flex items-center gap-2 font-bold text-gray-900 text-base">
            {icon}
            <span>{timeLabel}</span>
          </div>
          
          <div className="flex gap-2">
            <a 
              href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent((formData.destination || 'India') + ' ' + cleanText.substring(0, 50))}`} 
              target="_blank" 
              rel="noreferrer" 
              className="text-xs bg-white text-blue-700 border border-blue-200 px-3 py-1.5 rounded-full font-bold hover:bg-blue-50 flex items-center transition shadow-sm"
            >
              📸 View Photos
            </a>
            <a 
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent((formData.destination || 'India') + ' ' + cleanText.substring(0, 50))}`} 
              target="_blank" 
              rel="noreferrer" 
              className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-full font-bold hover:bg-green-700 flex items-center transition shadow-sm"
            >
              🗺️ Directions
            </a>
          </div>
        </div>

        <p className="text-sm text-gray-800 leading-relaxed font-medium pt-1">{text}</p>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto bg-white/95 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-gray-100 animate-fade-in relative">
      
      {/* Left Form Column */}
      <div className="p-8 w-full md:w-1/3 bg-gradient-to-b from-blue-50/80 to-indigo-50/80 border-r border-gray-100 flex flex-col justify-between">
        <div>
          <div className="flex items-center space-x-2 text-blue-600 font-bold text-xs uppercase tracking-widest mb-3">
            <Compass className="w-5 h-5 text-blue-600" /> AI Travel Intelligence
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-6">Smart Trip Planner</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            
            {/* DESTINATION CITY WITH VOICE ASSISTANCE */}
            <div>
              <label className="block font-bold text-gray-700 mb-1">Where do you want to go?</label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                  <input 
                    required 
                    type="text" 
                    className="w-full pl-9 pr-3 py-3 border rounded-xl outline-none bg-white focus:ring-2 ring-blue-400 text-sm font-medium" 
                    value={formData.destination} 
                    onChange={e => setFormData({...formData, destination: e.target.value})} 
                    placeholder="e.g. Araku, Tirupati, Arunachalam, Kedarnath" 
                  />
                </div>

                <button
                  type="button"
                  onClick={handleVoiceInput}
                  className={`p-3 rounded-xl transition-all flex-shrink-0 flex items-center justify-center border shadow-sm ${
                    isListening ? 'bg-red-600 text-white animate-pulse border-red-500' : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600'
                  }`}
                  title="Speak City or Place Name (Microphone Voice Search)"
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              </div>
              {voiceError && <p className="text-[11px] text-red-600 mt-1">{voiceError}</p>}
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Duration (Days)</label>
              <input required type="number" min="1" max="14" className="w-full p-3 border rounded-xl outline-none bg-white focus:ring-2 ring-blue-400" value={formData.days} onChange={e => setFormData({...formData, days: e.target.value})} />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Travel Interest</label>
              <select className="w-full p-3 border rounded-xl outline-none bg-white focus:ring-2 ring-blue-400" value={formData.interest} onChange={e => setFormData({...formData, interest: e.target.value})}>
                <option>Nature & Mountains</option>
                <option>Religious & Spiritual Shrines</option>
                <option>Heritage & Forts</option>
                <option>Adventure & Water Sports</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Budget Level</label>
              <select className="w-full p-3 border rounded-xl outline-none bg-white focus:ring-2 ring-blue-400" value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})}>
                <option>Low</option>
                <option>Medium</option>
                <option>High / Luxury</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Travel Type</label>
              <select className="w-full p-3 border rounded-xl outline-none bg-white focus:ring-2 ring-blue-400" value={formData.travelType} onChange={e => setFormData({...formData, travelType: e.target.value})}>
                <option>Family</option>
                <option>Solo Traveler</option>
                <option>Couples</option>
                <option>Friends Group</option>
              </select>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition shadow-lg text-base flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Generate Specific Itinerary'}
            </button>
          </form>
        </div>

        <div className="mt-8 text-xs text-gray-500 text-center">
          ⚡ Generates real specific place names, perfect visit times, and audio voice readouts.
        </div>
      </div>

      {/* Right Itinerary Column */}
      <div className="p-8 w-full md:w-2/3 flex flex-col justify-between">
        {!result && !loading && (
          <div className="text-gray-400 h-full min-h-[400px] flex flex-col items-center justify-center text-center space-y-3">
            <Compass className="w-16 h-16 text-gray-300 animate-pulse" />
            <div className="text-lg font-bold text-gray-600">No Itinerary Generated Yet</div>
            <p className="text-sm max-w-sm">Enter a destination city (e.g. Araku, Tirupati, Arunachalam, Kedarnath) or use the microphone button to speak your destination.</p>
          </div>
        )}

        {loading && (
          <div className="text-blue-600 h-full min-h-[400px] flex flex-col items-center justify-center text-center">
            <Loader2 className="animate-spin w-12 h-12 mb-4 text-blue-600" />
            <div className="text-xl font-bold text-gray-900">Consulting Gemini AI & Tourism Intelligence...</div>
            <p className="text-sm text-gray-500 mt-1">Analyzing optimal visit times, weather clarity, and scenic views.</p>
          </div>
        )}

        {error && <div className="text-red-600 font-bold p-4 bg-red-50 rounded-xl">{error}</div>}

        {result && (
          <div className="space-y-6">
            {fallbackMsg && <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-xl text-xs font-bold">{fallbackMsg}</div>}
            
            {/* ITINERARY HEADER WITH SPEAKER READOUT BUTTON */}
            <div className="flex justify-between items-center border-b pb-4 flex-wrap gap-4">
              <div>
                <div className="flex items-center space-x-1.5 text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">
                  <Sparkles className="w-4 h-4 text-blue-500" /> AI Curated Day-by-Day Plan
                </div>
                <h3 className="text-3xl font-extrabold text-gray-900">{result.title}</h3>
              </div>

              {/* SPEAKER VOICE READOUT BUTTON */}
              <button
                type="button"
                onClick={handleSpeakItinerary}
                className={`px-4 py-2.5 rounded-xl font-extrabold text-xs shadow-md transition flex items-center gap-2 border ${
                  isSpeakingPlan 
                    ? 'bg-red-600 text-white border-red-500 animate-pulse' 
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
                }`}
                title="Read Itinerary Aloud (Voice Speaker)"
              >
                {isSpeakingPlan ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                {isSpeakingPlan ? '⏹ Stop Voice Readout' : '🔊 Read Plan Aloud (Voice)'}
              </button>
            </div>
            
            <div className="space-y-8">
              {result.itinerary?.map((day, idx) => (
                <div key={idx} className="bg-gray-50/70 p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                  <h4 className="font-extrabold text-xl text-blue-900 flex items-center justify-between">
                    <span>Day {day.day}</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full uppercase tracking-wider font-bold">Curated Highlights</span>
                  </h4>
                  
                  <div className="space-y-4">
                    {renderSlot("Morning Highlight", day.morning, <Sunrise className="w-5 h-5 text-amber-500" />, "bg-amber-50/50 border-amber-100")}
                    {renderSlot("Afternoon Highlight", day.afternoon, <Sun className="w-5 h-5 text-orange-500" />, "bg-orange-50/50 border-orange-100")}
                    {renderSlot("Evening Highlight", day.evening, <Moon className="w-5 h-5 text-indigo-500" />, "bg-indigo-50/50 border-indigo-100")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default AIPlanner;
