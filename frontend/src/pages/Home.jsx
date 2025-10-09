import React, { useContext, useEffect, useRef, useState } from 'react';
import { userDataContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import aiImg from "../assets/ai.gif";
import userImg from "../assets/user.gif";
import { CgMenuRight } from "react-icons/cg";
import { RxCross1 } from "react-icons/rx";

function Home() {
  const { userData, serverUrl, setUserData, getGeminiResponse } = useContext(userDataContext);
  const navigate = useNavigate();

  const [listening, setListening] = useState(false);
  const [userText, setUserText] = useState("");
  const [aiText, setAiText] = useState("");
  const [ham, setHam] = useState(false);

  const synth = window.speechSynthesis;
  const recognitionRef = useRef(null);
  const isSpeakingRef = useRef(false);
  const isRecognizingRef = useRef(false);

  // 🚪 Logout
  const handleLogOut = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true });
      setUserData(null);
      navigate("/signin");
    } catch (error) {
      console.error("Logout error:", error);
      setUserData(null);
    }
  };

  // 🧠 Voice Output
  const speak = (text) => {
    synth.cancel(); // Stop any running speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN';

    // Try to use a natural Hindi voice if available
    const voices = synth.getVoices();
    const hindiVoice = voices.find(v => v.lang === 'hi-IN');
    if (hindiVoice) utterance.voice = hindiVoice;

    isSpeakingRef.current = true;
    utterance.rate = 1.05; // Slightly faster
    utterance.pitch = 1;   // Natural tone

    utterance.onend = () => {
      isSpeakingRef.current = false;
      setAiText("");
      // Restart recognition after short delay
      setTimeout(() => {
        if (!isRecognizingRef.current) startRecognition();
      }, 700);
    };

    synth.speak(utterance);
  };

  // 🎯 Command Handling
  const handleCommand = (data) => {
    const { type, userInput, response } = data;
    speak(response);

    const actions = {
      "google-search": () => window.open(`https://www.google.com/search?q=${encodeURIComponent(userInput)}`, '_blank'),
      "calculator-open": () => window.open(`https://www.google.com/search?q=calculator`, '_blank'),
      "instagram-open": () => window.open(`https://www.instagram.com/`, '_blank'),
      "facebook-open": () => window.open(`https://www.facebook.com/`, '_blank'),
      "weather-show": () => window.open(`https://www.google.com/search?q=weather`, '_blank'),
      "youtube-search": () => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(userInput)}`, '_blank'),
      "youtube-play": () => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(userInput)}`, '_blank'),
    };

    if (actions[type]) actions[type]();
  };

  // 🎙 Start Recognition
  const startRecognition = () => {
    const recognition = recognitionRef.current;
    if (!recognition || isSpeakingRef.current || isRecognizingRef.current) return;

    try {
      recognition.start();
      console.log("🎧 Recognition started");
    } catch (error) {
      if (error.name !== "InvalidStateError") console.error("Start error:", error);
    }
  };

  // 🧩 Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognitionRef.current = recognition;

    let isMounted = true;

    recognition.onstart = () => {
      isRecognizingRef.current = true;
      setListening(true);
      console.log("🎤 Listening...");
    };

    recognition.onend = () => {
      isRecognizingRef.current = false;
      setListening(false);
      if (isMounted && !isSpeakingRef.current) {
        setTimeout(() => startRecognition(), 500);
      }
    };

    recognition.onerror = (event) => {
      console.warn("⚠️ Recognition error:", event.error);
      isRecognizingRef.current = false;
      setListening(false);
      if (event.error !== "aborted" && isMounted && !isSpeakingRef.current) {
        setTimeout(() => startRecognition(), 1000);
      }
    };

    recognition.onresult = async (e) => {
      const transcript = e.results[e.results.length - 1][0].transcript.trim();
      console.log("🗣 Heard:", transcript);

      // Check if assistant name is mentioned
      if (transcript.toLowerCase().includes(userData.assistantName.toLowerCase())) {
        recognition.stop();
        setUserText(transcript);
        setAiText("");
        isRecognizingRef.current = false;
        setListening(false);

        const data = await getGeminiResponse(transcript);
        setAiText(data.response);
        handleCommand(data);
        setUserText("");
      }
    };

    // Greet user
    const greet = new SpeechSynthesisUtterance(`Hello ${userData.name}, how can I help you today?`);
    greet.lang = 'hi-IN';
    greet.rate = 1.05;
    synth.speak(greet);

    // Auto-start after short delay
    const initTimeout = setTimeout(() => startRecognition(), 1000);

    return () => {
      isMounted = false;
      clearTimeout(initTimeout);
      recognition.stop();
      synth.cancel();
    };
  }, []);

  return (
    <div className="w-full h-[100vh] bg-gradient-to-t from-black to-[#02023d] flex flex-col justify-center items-center gap-4 overflow-hidden relative">
      <CgMenuRight className="lg:hidden text-white absolute top-5 right-5 w-6 h-6 cursor-pointer" onClick={() => setHam(true)} />

      {/* Mobile menu */}
      <div className={`absolute lg:hidden top-0 w-full h-full bg-[#0000007a] backdrop-blur-lg p-5 flex flex-col gap-5 items-start transition-transform ${ham ? "translate-x-0" : "translate-x-full"}`}>
        <RxCross1 className="text-white absolute top-5 right-5 w-6 h-6 cursor-pointer" onClick={() => setHam(false)} />
        <button onClick={handleLogOut} className="min-w-[150px] h-[60px] bg-white text-black font-semibold rounded-full text-lg">Log Out</button>
        <button onClick={() => navigate("/customize")} className="min-w-[150px] h-[60px] bg-white text-black font-semibold rounded-full text-lg">Customize</button>
        <div className="w-full h-[2px] bg-gray-400"></div>
        <h1 className="text-white text-lg font-semibold">History</h1>
        <div className="w-full h-[400px] overflow-y-auto flex flex-col gap-3">
          {userData.history?.map((his, i) => (
            <div key={i} className="text-gray-200 text-[17px]">{his}</div>
          ))}
        </div>
      </div>

      {/* Buttons (Desktop) */}
      <button onClick={handleLogOut} className="hidden lg:block absolute top-5 right-5 bg-white text-black font-semibold rounded-full px-6 py-3 text-lg">Log Out</button>
      <button onClick={() => navigate("/customize")} className="hidden lg:block absolute top-[90px] right-5 bg-white text-black font-semibold rounded-full px-6 py-3 text-lg">Customize Your Assistant</button>

      {/* Assistant */}
      <div className="w-[300px] h-[400px] flex justify-center items-center overflow-hidden rounded-3xl shadow-lg">
        <img src={userData?.assistantImage} alt="" className="h-full object-cover" />
      </div>
      <h1 className="text-white text-lg font-semibold">I'm {userData?.assistantName}</h1>

      {!aiText ? (
        <img src={userImg} alt="user" className="w-[200px]" />
      ) : (
        <img src={aiImg} alt="ai" className="w-[200px]" />
      )}

      <h1 className="text-white text-lg font-semibold text-center max-w-[80%]">{userText || aiText || null}</h1>

      {listening && <div className="absolute bottom-10 text-green-400 text-sm">🎤 Listening...</div>}
    </div>
  );
}

export default Home;
