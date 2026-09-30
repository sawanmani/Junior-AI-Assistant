import { useState, useEffect, useRef, useCallback } from 'react';
import './Widgets.css';
import './SpeechTerminal.css';
import ResizeHandle from './ResizeHandle';

const SpeechTerminal = ({
  isListening,
  config = { shape: 'rounded', width: 160, height: 80, language: 'en-US' },
  style = {},
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onResize,
  onConversationUpdate,
  onMusicPlayRequest
}) => {
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isSpeechActive, setIsSpeechActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);
  const lastFinalTranscript = useRef('');
  const conversationTurnRef = useRef(0);


  // Send message to Groq LLM and get response with TTS (Optimized for minimal latency)
  const sendMessageToLLM = useCallback(async (message) => {
    const audioElement = new Audio();
    audioElement.volume = 1.0;

    try {
      setIsProcessing(true);
      setIsSpeaking(false);

      // Check if "Junior" wake word is mentioned (case insensitive)
      const lowerMessage = message.toLowerCase();
      const wakeWordDetected = lowerMessage.includes('junior');

      console.log('[WAKE WORD] Message:', message);
      console.log('[WAKE WORD] Detected:', wakeWordDetected);

      if (!wakeWordDetected) {
        // No wake word - just acknowledge without LLM call
        setCurrentTranscript('[WAITING] Say "Junior" to activate...');
        console.log('[WAKE WORD] Not triggered, waiting...');
        setIsProcessing(false);
        lastFinalTranscript.current = '';
        return; // Don't send to LLM
      }

      // Wake word detected - process the command
      setCurrentTranscript('[JUNIOR ACTIVATED] Processing...');

      // Check if message contains music play request
      // Patterns: "play [song]", "play song [song]", "play music [song]"
      const musicPlayPatterns = [
        /(?:junior\s+)?play\s+(?:me\s+)?(?:some\s+)?(?:music\s+)?(?:song\s+)?["']?(.+?)["']?(?:\s+on\s+youtube|\s+by\s+.+|$)/i,
        /(?:junior\s+)?play\s+(.+?)\s+song/i,
        /(?:junior\s+)?play\s+music\s+(.+?)/i
      ];

      let songName = null;
      let containsMusicRequest = false;

      // First check if "play" is in the message (after junior)
      if (lowerMessage.includes('play')) {
        for (const pattern of musicPlayPatterns) {
          const match = message.match(pattern);
          if (match && match[1] && match[1].trim().length > 0) {
            songName = match[1].trim();
            containsMusicRequest = true;
            console.log('[MUSIC] Pattern matched:', match[0]);
            break;
          }
        }

        // Fallback: extract text after "play" or "play song"
        if (!containsMusicRequest) {
          const simplePlayMatch = lowerMessage.match(/(?:junior\s+)?play\s+(?:me\s+)?(?:some\s+)?(.+?)(?:\s+on|\s+in|$)/i);
          if (simplePlayMatch && simplePlayMatch[1]) {
            songName = simplePlayMatch[1].trim();
            // Filter out common non-song phrases
            const excludePhrases = ['music', 'some music', 'a song', 'the song', 'something'];
            if (!excludePhrases.includes(songName.toLowerCase()) && songName.length > 1) {
              containsMusicRequest = true;
            }
          }
        }
      }

      console.log('[MUSIC] Contains music request:', containsMusicRequest);
      console.log('[MUSIC] Song name:', songName);

      // Check if message contains website opening request or app opening request
      const websiteKeywords = ['open', 'launch', 'start', 'search', 'find'];
      const containsWebsiteRequest = websiteKeywords.some(keyword =>
        lowerMessage.includes(keyword)
      ) && !containsMusicRequest; // Exclude if it's a music request

      const appKeywords = ['open app', 'launch app', 'start app', 'open application'];
      const containsAppRequest = appKeywords.some(keyword =>
        lowerMessage.includes(keyword)
      ) || ['capcut', 'filmora', 'photoshop', 'premiere', 'vscode', 'notepad', 'calculator'].some(app =>
        lowerMessage.includes(app)
      );

      console.log('[WEBSITE] Contains website request:', containsWebsiteRequest);
      console.log('[APP] Contains app request:', containsAppRequest);

      // Send to Groq LLM (ultra-fast)
      console.log('[CHAT] Sending:', message);

      const chatPromise = fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      const chatData = await chatPromise;
      console.log('[CHAT] Status:', chatData.status);

      const result = await chatData.json();
      console.log('[CHAT] Response:', result);

      if (!result.success) {
        throw new Error(result.error || 'LLM request failed');
      }

      const llmResponse = result.response;
      console.log('[LLM] Response text:', llmResponse);
      setCurrentTranscript(`JUNIOR > ${llmResponse}`);

      // Notify parent
      if (onConversationUpdate) {
        onConversationUpdate({ user: message, assistant: llmResponse });
      }

      if (containsWebsiteRequest || containsAppRequest) {
        console.log('[COMMAND] Parsing command from message...');

        const lowerMsg = lowerMessage;

        // === HANDLE APP OPENING ===
        if (containsAppRequest) {
          const appNames = [];
          const knownApps = ['capcut', 'filmora', 'wondershare filmora', 'photoshop', 'premiere', 'after effects',
            'illustrator', 'vscode', 'visual studio code', 'visual studio', 'notepad', 'calculator',
            'paint', 'word', 'excel', 'powerpoint', 'vlc', 'spotify',
            'discord', 'telegram', 'whatsapp', 'chrome', 'brave', 'edge',
            'firefox', 'settings', 'control panel', 'task manager', 'file explorer',
            'terminal', 'cmd', 'powershell', 'snipping tool', 'camera', 'photos',
            'store', 'onenote', 'outlook', 'teams', 'zoom', 'obs', 'audacity',
            'blender', 'figma', 'canva', 'steam', 'epic games'];

          for (const app of knownApps) {
            if (lowerMsg.includes(app)) {
              appNames.push(app);
            }
          }

          console.log('[APP] Detected:', appNames);

          if (appNames.length > 0) {
            try {
              const openAppsResponse = await fetch('http://localhost:5000/api/open-app', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apps: appNames })
              });

              const openAppsResult = await openAppsResponse.json();
              console.log('[APP] Opened:', openAppsResult);
            } catch (appError) {
              console.error('[APP] Failed to open:', appError);
            }
          }
        }

        // === HANDLE WEBSITE OPENING & SEARCHING ===
        if (containsWebsiteRequest) {
          const websiteNames = [];
          const knownSites = ['youtube', 'instagram', 'facebook', 'twitter', 'x', 'whatsapp',
            'gmail', 'google', 'netflix', 'amazon', 'flipkart', 'reddit',
            'linkedin', 'github', 'maps', 'telegram', 'discord', 'spotify',
            'news', 'chrome', 'brave',
            // AI Websites
            'chatgpt', 'chat gpt', 'gpt', 'gemini', 'qwen', 'qwen ai',
            'yup', 'yup ai', 'codepen', 'code pen', 'claude', 'copilot',
            'bing chat', 'perplexity', 'huggingface', 'replit', 'colab',
            'kaggle', 'midjourney', 'dalle', 'stability', 'runway',
            'notion', 'canva', 'figma', 'trello', 'slack', 'zoom', 'meet'];

          for (const site of knownSites) {
            if (lowerMsg.includes(site)) {
              websiteNames.push(site);
            }
          }

          // Extract search query (text after "search", "play", or "find")
          let searchQuery = null;
          const searchPatterns = [/search\s+(?:for\s+)?(.+?)(?:\s+on|\s+in|$)/i,
            /play\s+(.+?)(?:\s+on|\s+in|$)/i,
            /find\s+(.+?)(?:\s+on|\s+in|$)/i];

          for (const pattern of searchPatterns) {
            const match = message.match(pattern);
            if (match && match[1]) {
              searchQuery = match[1].trim();
              break;
            }
          }

          // Determine browser preference
          const browser = lowerMsg.includes('chrome') ? 'chrome' : 'brave';

          console.log('[WEBSITE] Detected:', websiteNames);
          console.log('[WEBSITE] Search query:', searchQuery);
          console.log('[WEBSITE] Browser:', browser);

          if (websiteNames.length > 0) {
            try {
              const openWebResponse = await fetch('http://localhost:5000/api/open-website', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  websites: websiteNames,
                  browser: browser,
                  searchQuery: searchQuery
                })
              });

              const openWebResult = await openWebResponse.json();
              console.log('[WEBSITE] Opened:', openWebResult);
            } catch (webError) {
              console.error('[WEBSITE] Failed to open:', webError);
            }
          }
        }
      }

      // === HANDLE MUSIC PLAY REQUEST ===
      if (containsMusicRequest && songName) {
        console.log('[MUSIC] Playing song:', songName);

        // Notify music player to play the song
        if (onMusicPlayRequest) {
          onMusicPlayRequest(songName);
        }
      }

      // Convert to speech (optimized for low latency)
      console.log('[TTS] Converting:', llmResponse.substring(0, 40));

      // Only attempt TTS if there's actual text content
      if (!llmResponse || llmResponse.trim().length < 2) {
        console.log('[TTS] Skipping - empty response');
        setIsProcessing(false);
        return;
      }

      // Create audio element with optimized settings
      const audioElement = new Audio();
      audioElement.volume = 1.0;
      audioElement.preload = 'auto';

      try {
        // Fetch TTS audio
        const ttsResponse = await fetch('http://localhost:5000/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: llmResponse })
        });

        if (!ttsResponse.ok) {
          throw new Error(`TTS failed: ${ttsResponse.status}`);
        }

        // Get audio blob and play immediately
        const audioBlob = await ttsResponse.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        audioElement.src = audioUrl;
        setIsSpeaking(true);

        // Play immediately
        await audioElement.play();
        console.log('[AUDIO] Playing:', audioBlob.size, 'bytes');

        // Cleanup when done
        audioElement.onended = () => {
          console.log('[AUDIO] Finished');
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          lastFinalTranscript.current = '';
        };

        audioElement.onerror = (e) => {
          console.error('[AUDIO] Error:', e);
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          lastFinalTranscript.current = '';
        };

      } catch (err) {
        console.error('[TTS] Error:', err.message);
        setIsSpeaking(false);
        setIsProcessing(false);
        // Don't throw - just continue without audio
      }

      setIsProcessing(false);
    } catch (error) {
      console.error('[ERROR]', error.message);
      setCurrentTranscript(`[ERROR] ${error.message}`);
      setIsProcessing(false);
      setIsSpeaking(false);
      lastFinalTranscript.current = '';
    }
  }, [onConversationUpdate]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setCurrentTranscript('[SYSTEM_ERROR] Web Speech API not supported. Try Chrome/Edge.');
      return;
    }

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = config.language || 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setCurrentTranscript('[LISTENING] Speak now...');
        setIsSpeechActive(true);
      };

      recognition.onresult = async (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        // Only process new final transcripts
        if (finalTranscript && finalTranscript.trim() !== lastFinalTranscript.current.trim()) {
          const cleanTranscript = finalTranscript.trim();
          lastFinalTranscript.current = cleanTranscript;
          setCurrentTranscript(`YOU > ${cleanTranscript}`);

          // Send to LLM immediately (reduced delay for faster response)
          setTimeout(() => {
            if (cleanTranscript.length > 0) {
              sendMessageToLLM(cleanTranscript);
            }
          }, 300); // Reduced from 800ms to 300ms
        } else if (interimTranscript) {
          setCurrentTranscript(`YOU > ${interimTranscript}`);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);

        if (event.error === 'no-speech') {
          setCurrentTranscript('[NO SPEECH] Try again...');
        } else if (event.error === 'audio-capture') {
          setCurrentTranscript('[ERROR] No microphone detected.');
        } else if (event.error === 'not-allowed') {
          setCurrentTranscript('[ERROR] Microphone permission denied.');
        } else if (event.error === 'aborted') {
          setCurrentTranscript('[STOPPED] Listening cancelled.');
        } else {
          setCurrentTranscript(`[ERROR] ${event.error}`);
        }
        setIsSpeechActive(false);
      };

      recognition.onend = () => {
        setIsSpeechActive(false);

        // Auto-restart if still in listening mode and not processing/speaking
        if (isListening && recognitionRef.current && !isProcessing && !isSpeaking) {
          setTimeout(() => {
            try {
              recognitionRef.current.start();
            } catch (e) {
              console.error('Auto-restart failed:', e);
            }
          }, 500);
        } else if (!isListening) {
          setCurrentTranscript('[MIC OFF] Click MIC to activate.');
        }
      };

      recognitionRef.current = recognition;
    }

    const rec = recognitionRef.current;

    // Start listening
    if (isListening && !isProcessing && !isSpeaking) {
      try {
        rec.start();
      } catch (e) {
        // Already running
      }
    }
    // Stop listening
    else if (!isListening) {
      try {
        rec.stop();
      } catch (e) {
        // Already stopped
      }
      setCurrentTranscript('');
      lastFinalTranscript.current = '';
    }

    // Cleanup
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        try {
          recognitionRef.current.stop();
        } catch (e) { }
        recognitionRef.current = null;
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, [isListening, isProcessing, isSpeaking, config.language, sendMessageToLLM]);

  // Get status indicator color
  const getStatusColor = () => {
    if (isSpeaking) return '#00ff44'; // Green - speaking
    if (isProcessing) return '#ffaa00'; // Orange - thinking
    if (isListening) {
      if (isSpeechActive) return '#00ffe1'; // Cyan - listening
      return '#ffaa00'; // Orange - inactive
    }
    return '#ff0000'; // Red - off
  };

  const getStatusClass = () => {
    if (isSpeaking) return 'is-speaking';
    if (isProcessing) return 'is-processing';
    if (isListening) return 'is-listening';
    return 'is-offline';
  };

  return (
    <div
      className={`glass-widget speech-terminal shape-${config.shape} ${getStatusClass()}`}
      style={{
        ...style,
        width: `${config.width}px`,
        height: `${config.height}px`,
      }}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {/* Corner Brackets */}
      <div className="corner-accent top-left" />
      <div className="corner-accent top-right" />
      <div className="corner-accent bottom-left" />
      <div className="corner-accent bottom-right" />

      <div className="terminal-header" onPointerDown={onPointerDown}>
        <div className="status-indicator" />
        <span className="terminal-title">JUNIOR - {isSpeaking ? 'SPEAKING' : isProcessing ? 'PROCESSING' : isListening ? (isSpeechActive ? 'LISTENING' : 'STANDBY') : 'OFFLINE'}</span>
      </div>
      <div className="terminal-body">
        {currentTranscript && (
          <div
            className={`log-entry ${currentTranscript.startsWith('[SYSTEM') ||
              currentTranscript.startsWith('[ERROR]') ||
              currentTranscript.startsWith('[LISTENING]') ||
              currentTranscript.startsWith('[NO SPEECH]') ||
              currentTranscript.startsWith('[MIC OFF]') ||
              currentTranscript.startsWith('[STOPPED]') ||
              currentTranscript.startsWith('[JUNIOR THINKING]')
              ? 'system'
              : currentTranscript.startsWith('JUNIOR')
                ? 'assistant'
                : 'user'
              }`}
            style={{ fontSize: '10px', textAlign: 'center', fontWeight: '700', letterSpacing: '1px' }}
          >
            {currentTranscript}
            {!isSpeaking && !isProcessing && <span className="cursor" style={{ height: '8px' }}>_</span>}
          </div>
        )}
        {!currentTranscript && isListening && !isProcessing && !isSpeaking && (
          <div className="log-entry system" style={{ fontSize: '10px', textAlign: 'center', fontWeight: '700', letterSpacing: '1px' }}>
            [READY] Awaiting your voice...
            <span className="cursor" style={{ height: '8px' }}>_</span>
          </div>
        )}
      </div>
      <ResizeHandle
        onResize={onResize}
        width={config?.width}
        height={config?.height}
      />
      {/* Hidden audio element for TTS playback */}
      <audio
        ref={audioRef}
        style={{ display: 'none' }}
        preload="auto"
        playsInline
        crossOrigin="anonymous"
      />
    </div>
  );
};

export default SpeechTerminal;
