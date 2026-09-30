import express from 'express';
import cors from 'cors';
import { spawn, exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Groq API Configuration (Fast, Free LLM)
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// User Location Configuration (Default - will use browser's actual location)
const USER_LOCATION = {
  city: 'Your Location',
  state: '',
  country: '',
  latitude: null,
  longitude: null,
  timezone: 'Local',
  timezoneOffset: 'Local'
};

// Website mappings with search support
const WEBSITE_MAPPING = {
  'youtube': 'https://www.youtube.com',
  'instagram': 'https://www.instagram.com',
  'facebook': 'https://www.facebook.com',
  'twitter': 'https://www.twitter.com',
  'x': 'https://www.twitter.com',
  'whatsapp': 'https://web.whatsapp.com',
  'gmail': 'https://mail.google.com',
  'google': 'https://www.google.com',
  'netflix': 'https://www.netflix.com',
  'amazon': 'https://www.amazon.in',
  'flipkart': 'https://www.flipkart.com',
  'reddit': 'https://www.reddit.com',
  'linkedin': 'https://www.linkedin.com',
  'github': 'https://www.github.com',
  'stackoverflow': 'https://stackoverflow.com',
  'maps': 'https://maps.google.com',
  'drive': 'https://drive.google.com',
  'photos': 'https://photos.google.com',
  'telegram': 'https://web.telegram.org',
  'discord': 'https://discord.com',
  'spotify': 'https://open.spotify.com',
  'news': 'https://news.google.com',
  'chrome': 'browser',
  'brave': 'browser',
  // AI Websites
  'chatgpt': 'https://chat.openai.com',
  'chat gpt': 'https://chat.openai.com',
  'gpt': 'https://chat.openai.com',
  'gemini': 'https://gemini.google.com',
  'google gemini': 'https://gemini.google.com',
  'qwen': 'https://chat.qwen.ai',
  'qwen ai': 'https://chat.qwen.ai',
  'yup': 'https://yup.ai',
  'yup ai': 'https://yup.ai',
  'codepen': 'https://codepen.io',
  'code pen': 'https://codepen.io',
  'claude': 'https://claude.ai',
  'anthropic': 'https://claude.ai',
  'copilot': 'https://copilot.microsoft.com',
  'bing chat': 'https://copilot.microsoft.com',
  'perplexity': 'https://www.perplexity.ai',
  'huggingface': 'https://huggingface.co',
  'hugging face': 'https://huggingface.co',
  'replit': 'https://replit.com',
  'colab': 'https://colab.research.google.com',
  'kaggle': 'https://www.kaggle.com',
  'midjourney': 'https://www.midjourney.com',
  'dalle': 'https://labs.openai.com',
  'dall-e': 'https://labs.openai.com',
  'stability': 'https://platform.stability.ai',
  'runway': 'https://runwayml.com',
  'notion': 'https://www.notion.so',
  'canva': 'https://www.canva.com',
  'figma': 'https://www.figma.com',
  'trello': 'https://trello.com',
  'slack': 'https://slack.com',
  'zoom': 'https://zoom.us',
  'meet': 'https://meet.google.com'
};

// Application mappings (Windows) - Using executable names
const APP_MAPPING = {
  'capcut': 'CapCut',
  'cap cut': 'CapCut',
  'filmora': 'Filmora',
  'wondershare filmora': 'Filmora',
  'photoshop': 'Photoshop',
  'adobe photoshop': 'Photoshop',
  'premiere': 'Premiere Pro',
  'premiere pro': 'Premiere Pro',
  'adobe premiere': 'Premiere Pro',
  'after effects': 'After Effects',
  'adobe after effects': 'After Effects',
  'illustrator': 'Illustrator',
  'adobe illustrator': 'Illustrator',
  'vscode': 'Code',
  'visual studio code': 'Code',
  'code': 'Code',
  'visual studio': 'Visual Studio',
  'notepad': 'notepad.exe',
  'calculator': 'calc.exe',
  'paint': 'mspaint.exe',
  'word': 'winword.exe',
  'microsoft word': 'winword.exe',
  'excel': 'excel.exe',
  'microsoft excel': 'excel.exe',
  'powerpoint': 'powerpnt.exe',
  'microsoft powerpoint': 'powerpnt.exe',
  'chrome': 'chrome.exe',
  'google chrome': 'chrome.exe',
  'brave': 'brave.exe',
  'brave browser': 'brave.exe',
  'edge': 'msedge.exe',
  'microsoft edge': 'msedge.exe',
  'firefox': 'firefox.exe',
  'vlc': 'vlc.exe',
  'vlc media player': 'vlc.exe',
  'spotify': 'spotify.exe',
  'discord': 'Discord.exe',
  'telegram': 'Telegram.exe',
  'whatsapp': 'WhatsApp.exe',
  'settings': 'ms-settings:',
  'control panel': 'control.exe',
  'task manager': 'taskmgr.exe',
  'file explorer': 'explorer.exe',
  'explorer': 'explorer.exe',
  'terminal': 'wt.exe',
  'windows terminal': 'wt.exe',
  'cmd': 'cmd.exe',
  'command prompt': 'cmd.exe',
  'powershell': 'powershell.exe',
  'snipping tool': 'SnippingTool.exe',
  'camera': 'Microsoft.Windows.Camera:',
  'photos': 'Microsoft.Windows.Photos:',
  'store': 'Microsoft.Windows.Store:',
  'onenote': 'ONENOTE.exe',
  'outlook': 'OUTLOOK.exe',
  'teams': 'teams.exe',
  'microsoft teams': 'teams.exe',
  'zoom': 'zoom.exe',
  'obs': 'obs64.exe',
  'obs studio': 'obs64.exe',
  'audacity': 'audacity.exe',
  'blender': 'blender.exe',
  'figma': 'Figma.exe',
  'canva': 'Canva.exe',
  'steam': 'steam.exe',
  'epic games': 'EpicGamesLauncher.exe'
};

// Conversation history for context
const conversationHistory = [
  {
    role: 'system',
    content: `You are JUNIOR, a friendly AI assistant created to help SENIOR.

IMPORTANT RULES - FOLLOW EXACTLY:
1. ONLY respond when "JUNIOR" is mentioned in the message
2. If "JUNIOR" is NOT mentioned, respond with: "I'm listening." or stay silent
3. Use "Senior" ONLY ONCE per response - either at the beginning OR end, not both
4. Speak in a warm, friendly, and respectful tone
5. ONLY communicate in ENGLISH
6. Keep responses very short (1-2 sentences max, under 50 words)
7. Be conversational, natural, and helpful
8. Do NOT repeat "Senior" multiple times in the same response
9. NEVER include your reasoning, thoughts, or analysis in the response
10. Output ONLY the final response - no thinking, no explanations

CAPABILITIES:
- Open websites (YouTube, Instagram, Facebook, etc.)
- Open applications (CapCut, Filmora, Photoshop, etc.)
- Play music on YouTube (say "Junior play [song name]")
- Search on YouTube (videos, music)
- Search on Google (queries, information)
- Open Chrome or Brave browser for searches
- Can do multiple tasks in one command

When Senior asks to:
- "search on YouTube" → Confirm you'll search on YouTube
- "search on Google" → Confirm you'll search on Google
- "play [song name]" → Confirm you'll play the song on YouTube
- "open [app name]" → Confirm which app you're opening
- Multiple tasks → List all tasks you're doing

Example responses:
- "Opening CapCut right away, Senior."
- "Sure! I'll search for that on YouTube."
- "Yes, Senior! Playing your song on YouTube now."
- "I'll play that music for you, Senior!"
- "Opening Filmora and Chrome for you!"

Remember: Use "Senior" only ONCE per response, never repeat it. NEVER include your thinking process.`
  }
];

// Store client weather data
let clientWeatherData = {
  temp: '--',
  condition: 'LOADING...',
  humidity: '--',
  location: USER_LOCATION.city.toUpperCase() + ', ' + USER_LOCATION.country
};

// Get weather
app.get('/api/weather', (req, res) => {
  res.json(clientWeatherData);
});

// Update weather from client
app.post('/api/weather', (req, res) => {
  const { temp, condition, humidity, location } = req.body;
  clientWeatherData = {
    temp: temp || '--',
    condition: condition || 'UNKNOWN',
    humidity: humidity || '--',
    location: location || USER_LOCATION.city.toUpperCase()
  };
  res.json({ success: true, data: clientWeatherData });
});

// Get weather by coordinates (uses browser's location or defaults)
app.get('/api/weather/coords', async (req, res) => {
  try {
    // Use provided coordinates or defaults
    const lat = req.query.lat || 20.5937; // Central India as fallback
    const lon = req.query.lon || 78.9629;

    console.log('[WEATHER] Fetching for:', lat, lon);

    // Fetch current weather data including humidity
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=auto`;
    const weatherResponse = await fetch(weatherUrl);
    const weatherData = await weatherResponse.json();

    const geoUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
    const geoResponse = await fetch(geoUrl);
    const geoData = await geoResponse.json();

    const currentData = weatherData.current || {};
    const locationName = geoData.city || geoData.locality || 'Your Location';

    const weatherInfo = {
      temp: `${Math.round(currentData.temperature_2m || 0)}°C`,
      condition: getWeatherCondition(currentData.weather_code || 0),
      humidity: `${currentData.relative_humidity_2m !== undefined ? currentData.relative_humidity_2m : '--'}%`,
      location: locationName.toUpperCase()
    };

    clientWeatherData = weatherInfo;
    console.log('[WEATHER] Result:', weatherInfo);
    res.json(weatherInfo);
  } catch (error) {
    console.error('[WEATHER] Error:', error.message);
    res.status(500).json({
      temp: '--',
      condition: 'ERROR',
      humidity: '--',
      location: 'UNAVAILABLE'
    });
  }
});

// Open website(s) in Brave or Chrome browser
app.post('/api/open-website', async (req, res) => {
  try {
    const { websites, browser = 'brave', searchQuery = null } = req.body;

    if (!websites || !Array.isArray(websites) || websites.length === 0) {
      return res.status(400).json({ error: 'No websites provided' });
    }

    console.log('[WEBSITE] Opening:', websites, 'Browser:', browser, 'Search:', searchQuery);

    const openedWebsites = [];
    const failedWebsites = [];

    for (const site of websites) {
      const siteLower = site.toLowerCase().trim();
      let url = WEBSITE_MAPPING[siteLower];

      // If search query provided for YouTube or Google
      if (searchQuery && (siteLower === 'youtube' || siteLower === 'google')) {
        if (siteLower === 'youtube') {
          url = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
        } else if (siteLower === 'google') {
          url = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
        }
      }

      // If not in mapping, try to use as direct URL
      if (!url || url === 'browser') {
        if (site.startsWith('http://') || site.startsWith('https://')) {
          url = site;
        } else if (siteLower === 'chrome' || siteLower === 'brave') {
          // Browser will be handled separately
          continue;
        } else {
          url = `https://www.${siteLower}.com`;
        }
      }

      try {
        const browserName = browser === 'chrome' ? 'chrome' : 'brave';
        const command = process.platform === 'win32' ? 'start' : 'open';
        const args = process.platform === 'win32'
          ? [browserName, `"${url}"`]
          : ['-a', browserName === 'brave' ? 'Brave Browser' : 'Google Chrome', url];

        const proc = spawn(command, args, {
          shell: true,
          detached: true,
          stdio: 'ignore'
        });

        proc.unref();
        openedWebsites.push(site);
        console.log('[WEBSITE] Opened:', url, 'in', browserName);
      } catch (err) {
        console.error('[WEBSITE] Failed to open:', site, err.message);
        failedWebsites.push(site);
      }
    }

    res.json({
      success: true,
      opened: openedWebsites,
      failed: failedWebsites,
      message: `Opened ${openedWebsites.length} website(s)`
    });
  } catch (error) {
    console.error('[WEBSITE] Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Open application(s) - Windows optimized
app.post('/api/open-app', async (req, res) => {
  try {
    const { apps } = req.body;

    if (!apps || !Array.isArray(apps) || apps.length === 0) {
      return res.status(400).json({ error: 'No applications provided' });
    }

    console.log('[APP] Opening:', apps);

    const openedApps = [];
    const failedApps = [];

    // UWP apps (Windows Store apps) - use protocol
    const UWP_APPS = {
      'calculator': 'calculator:',
      'settings': 'ms-settings:',
      'store': 'ms-windows-store:',
      'photos': 'ms-photos:',
      'camera': 'microsoft.windows.camera:',
      'your phone': 'yourphone:',
      'xbox': 'xbox:',
      'notepad': 'notepad.exe',
      'paint': 'mspaint.exe',
      'word': 'winword.exe',
      'excel': 'excel.exe',
      'powerpoint': 'powerpnt.exe',
      'cmd': 'cmd.exe',
      'command prompt': 'cmd.exe',
      'powershell': 'powershell.exe',
      'terminal': 'wt.exe',
      'task manager': 'taskmgr.exe',
      'control panel': 'control.exe',
      'file explorer': 'explorer.exe',
      'explorer': 'explorer.exe'
    };

    for (const app of apps) {
      const appLower = app.toLowerCase().trim();

      try {
        // Check if it's a UWP/system app
        if (UWP_APPS[appLower]) {
          const command = `start ${UWP_APPS[appLower]}`;
          exec(command, { shell: true });
          openedApps.push(app);
          console.log('[APP] Opened UWP/System:', app);
          continue;
        }

        // For other apps, use Windows start command
        // Windows will search PATH and registered applications
        const command = `start "" "${appLower}"`;
        exec(command, { shell: true, detached: true }, (err) => {
          if (err) {
            console.error('[APP] Error launching:', app, err.message);
          }
        });

        openedApps.push(app);
        console.log('[APP] Launched:', app);

      } catch (err) {
        console.error('[APP] Failed to open:', app, err.message);
        failedApps.push(app);
      }
    }

    res.json({
      success: true,
      opened: openedApps,
      failed: failedApps,
      message: `Opened ${openedApps.length} application(s)`
    });
  } catch (error) {
    console.error('[APP] Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get list of available websites and apps
app.get('/api/apps', (req, res) => {
  res.json({
    success: true,
    websites: Object.keys(WEBSITE_MAPPING),
    applications: Object.keys(APP_MAPPING),
    location: USER_LOCATION
  });
});

// LLM Chat endpoint with website opening capability
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message required' });
    }

    console.log('[CHAT] Message:', message);

    // Add user message to history
    conversationHistory.push({ role: 'user', content: message });

    // Keep only last 8 messages
    if (conversationHistory.length > 8) {
      conversationHistory.splice(1, conversationHistory.length - 8);
    }

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen/qwen3-32b',
        messages: conversationHistory,
        max_tokens: 150,
        temperature: 0.7,
        top_p: 1,
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Groq API error');
    }

    const data = await response.json();
    let assistantMessage = data.choices[0].message.content;

    // Aggressive cleanup of thinking/reasoning content
    // Remove think tags with any content inside
    assistantMessage = assistantMessage.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
    assistantMessage = assistantMessage.replace(/<think>[\s\S]*/gi, '').trim();
    // Remove > quote lines (reasoning)
    assistantMessage = assistantMessage.replace(/^>.*$/gm, '').trim();
    assistantMessage = assistantMessage.replace(/^\s*>.*$/gm, '').trim();
    // Remove "Okay, let me..." reasoning patterns
    assistantMessage = assistantMessage.replace(/^(Okay|Alright|Let me|Hmm|Wait|I need|The user|They|This|So|But|Maybe)\s.*$/gim, '').trim();
    // Remove any remaining tags
    assistantMessage = assistantMessage.replace(/<[^>]*>/g, '').trim();
    // Clean up markdown
    assistantMessage = assistantMessage.replace(/\*\*/g, '').trim();
    assistantMessage = assistantMessage.replace(/\*/g, '').trim();
    // Clean up multiple newlines
    assistantMessage = assistantMessage.replace(/\n{2,}/g, ' ').trim();
    assistantMessage = assistantMessage.replace(/\s+/g, ' ').trim();

    // If message is empty or still contains reasoning, use fallback
    if (!assistantMessage || assistantMessage.length < 2 ||
      assistantMessage.toLowerCase().includes('let me') ||
      assistantMessage.toLowerCase().includes('i need') ||
      assistantMessage.toLowerCase().includes('the user')) {
      assistantMessage = "I'm here and ready to help, Senior! What do you need?";
    }

    console.log('[CHAT] Clean Response:', assistantMessage.substring(0, 100));

    // Add assistant response to history
    conversationHistory.push({ role: 'assistant', content: assistantMessage });

    res.json({
      success: true,
      response: assistantMessage
    });
  } catch (error) {
    console.error('[CHAT] Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get LLM response'
    });
  }
});

// Text-to-Speech endpoint - Using Google TTS (British Female voice)
app.post('/api/tts', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text required' });
    }

    // Clean text - remove emojis and special chars that break TTS
    const cleanText = text.replace(/[^\w\s.,!?\'-]/g, '').trim();

    if (cleanText.length === 0) {
      return res.status(400).json({ error: 'No valid text for TTS' });
    }

    // Google TTS - British Female voice (en-GB)
    const encodedText = encodeURIComponent(cleanText);
    const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en-GB&client=gtx&q=${encodedText}`;

    const audioResponse = await fetch(googleTtsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'audio/mpeg',
        'Accept-Language': 'en-GB,en;q=0.9'
      }
    });

    if (!audioResponse.ok) {
      throw new Error(`Google TTS error: ${audioResponse.status}`);
    }

    const audioBuffer = await audioResponse.arrayBuffer();
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(Buffer.from(audioBuffer));
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'TTS unavailable: ' + error.message
    });
  }
});

// Clear conversation history
app.post('/api/clear-history', (req, res) => {
  conversationHistory.length = 1;
  console.log('[CHAT] History cleared');
  res.json({ success: true });
});

// Get conversation history
app.get('/api/history', (req, res) => {
  res.json({ history: conversationHistory });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    location: USER_LOCATION,
    services: {
      groq: 'configured',
      googleTts: 'configured'
    }
  });
});

// Music Search API - Search YouTube for music
app.post('/api/music/search', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: 'Search query required' });
    }

    console.log('[MUSIC] Searching for:', query);

    // Search YouTube using Data API
    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&q=${encodeURIComponent(query + ' official audio')}&key=${YOUTUBE_API_KEY}&maxResults=1`;

    const response = await fetch(searchUrl);
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      // Fallback: return YouTube search URL
      return res.json({
        success: true,
        source: 'youtube_search',
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query + ' song')}`,
        message: `Playing ${query} on YouTube`
      });
    }

    const video = data.items[0];
    const videoId = video.id.videoId;
    const title = video.snippet.title;
    const channel = video.snippet.channelTitle;
    const thumbnail = video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default?.url;

    res.json({
      success: true,
      source: 'youtube',
      videoId: videoId,
      title: title,
      artist: channel,
      thumbnail: thumbnail,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      message: `Playing ${title} by ${channel}`
    });
  } catch (error) {
    console.error('[MUSIC] Search error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Play music - opens YouTube or sends to player
app.post('/api/music/play', async (req, res) => {
  try {
    const { songName, autoPlay = false } = req.body;

    if (!songName || songName.trim().length === 0) {
      return res.status(400).json({ error: 'Song name required' });
    }

    console.log('[MUSIC] Play request:', songName);

    // Search for the song
    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&q=${encodeURIComponent(songName + ' official audio')}&key=${YOUTUBE_API_KEY}&maxResults=1`;

    const response = await fetch(searchUrl);
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      // Open YouTube search in browser
      const searchQuery = encodeURIComponent(songName + ' song');
      const url = `https://www.youtube.com/results?search_query=${searchQuery}`;

      const command = process.platform === 'win32' ? 'start' : 'open';
      const args = process.platform === 'win32'
        ? ['brave', `"${url}"`]
        : ['-a', 'Brave Browser', url];

      spawn(command, args, { shell: true, detached: true, stdio: 'ignore' });

      return res.json({
        success: true,
        source: 'youtube_search',
        url: url,
        message: `Opening YouTube search for ${songName}`
      });
    }

    const video = data.items[0];
    const videoId = video.id.videoId;
    const title = video.snippet.title;
    const channel = video.snippet.channelTitle;
    const thumbnail = video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default?.url;
    const url = `https://www.youtube.com/watch?v=${videoId}`;

    // If autoPlay is false, return data for player component
    if (!autoPlay) {
      return res.json({
        success: true,
        source: 'youtube',
        videoId: videoId,
        title: title,
        artist: channel,
        thumbnail: thumbnail,
        url: url,
        message: `Found ${title} by ${channel}`
      });
    }

    // Auto-play: open in browser
    const command = process.platform === 'win32' ? 'start' : 'open';
    const args = process.platform === 'win32'
      ? ['brave', `"${url}"`]
      : ['-a', 'Brave Browser', url];

    spawn(command, args, { shell: true, detached: true, stdio: 'ignore' });

    res.json({
      success: true,
      source: 'youtube',
      videoId: videoId,
      title: title,
      artist: channel,
      thumbnail: thumbnail,
      url: url,
      message: `Playing ${title} by ${channel} in browser`
    });
  } catch (error) {
    console.error('[MUSIC] Play error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Helper function for weather codes
function getWeatherCondition(code) {
  const conditions = {
    0: 'CLEAR SKY',
    1: 'MAINLY CLEAR',
    2: 'PARTLY CLOUDY',
    3: 'OVERCAST',
    45: 'FOGGY',
    48: 'DEPOSITING RIME FOG',
    51: 'LIGHT DRIZZLE',
    53: 'MODERATE DRIZZLE',
    55: 'DENSE DRIZZLE',
    61: 'SLIGHT RAIN',
    63: 'MODERATE RAIN',
    65: 'HEAVY RAIN',
    71: 'SLIGHT SNOW',
    73: 'MODERATE SNOW',
    75: 'HEAVY SNOW',
    77: 'SNOW GRAINS',
    80: 'SLIGHT RAIN SHOWERS',
    81: 'MODERATE RAIN SHOWERS',
    82: 'VIOLENT RAIN SHOWERS',
    95: 'THUNDERSTORM',
    96: 'THUNDERSTORM WITH HAIL',
    99: 'THUNDERSTORM WITH HEAVY HAIL'
  };
  return conditions[code] || 'UNKNOWN';
}

app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`JUNIOR AI Assistant`);
  console.log(`========================================`);
  console.log(`Server: http://localhost:${PORT}`);
  console.log(`Groq API: ${GROQ_API_KEY ? GROQ_API_KEY.substring(0, 8) + '...' : 'NOT SET (add GROQ_API_KEY to backend/.env)'}`);
  console.log(`----------------------------------------`);
  console.log(`Features:`);
  console.log(`  ✓ Wake word: "Junior"`);
  console.log(`  ✓ Opens websites in Brave browser`);
  console.log(`  ✓ Multi-tasking (multiple websites)`);
  console.log(`  ✓ Location-aware weather & time`);
  console.log(`  ✓ Addresses user as "Senior"`);
  console.log(`  ✓ Voice: Google TTS (British Female)`);
  console.log(`----------------------------------------`);
  console.log(`Endpoints:`);
  console.log(`  GET  /api/health`);
  console.log(`  GET  /api/websites - List available sites`);
  console.log(`  POST /api/open-website - Open website(s)`);
  console.log(`  POST /api/chat - LLM Chat`);
  console.log(`  POST /api/tts - Text to Speech`);
  console.log(`========================================\n`);
});
