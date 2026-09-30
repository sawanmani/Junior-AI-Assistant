import { useState, useRef, useEffect, useCallback } from 'react';
import './JuniorMusicPlayer.css';
import ResizeHandle from './ResizeHandle';

// API Configuration
const API_ENDPOINTS = {
  ITUNES_SEARCH: 'https://itunes.apple.com/search',
  YOUTUBE_SEARCH: 'https://www.googleapis.com/youtube/v3/search',
};

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || '';

// Default tracks for YouTube (optional, can be empty)
const DEFAULT_TRACKS = [];

const JuniorMusicPlayer = ({ config, style, onPointerDown, onPointerMove, onPointerUp, onResize, onVoicePlayRequest, playerApiRef }) => {
  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState(0); // 0: off, 1: all, 2: one
  const [currentSource, setCurrentSource] = useState('youtube');
  const [tracks, setTracks] = useState(DEFAULT_TRACKS);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  // Refs
  const audioRef = useRef(null);
  const playerRef = useRef(null);
  const youtubePlayerRef = useRef(null);

  // Load saved volume
  useEffect(() => {
    const savedVolume = localStorage.getItem('juniorMusicVolume');
    if (savedVolume) {
      setVolume(parseInt(savedVolume));
      if (audioRef.current) audioRef.current.volume = parseInt(savedVolume) / 100;
    }
  }, []);

  // Save volume
  useEffect(() => {
    localStorage.setItem('juniorMusicVolume', volume.toString());
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume]);

  // Load YouTube IFrame API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
  }, []);

  // Update progress bar interval for YouTube
  useEffect(() => {
    let interval;
    if (isPlaying && currentSource === 'youtube' && youtubePlayerRef.current) {
      interval = setInterval(() => {
        const currentTime = youtubePlayerRef.current.getCurrentTime();
        const duration = youtubePlayerRef.current.getDuration();
        setCurrentTime(currentTime);
        setDuration(duration);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentSource]);

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration || 0);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleEnded = () => {
      handleTrackEnd();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrackIndex, repeatMode, isShuffle]);

  // Search YouTube
  const searchYouTube = useCallback(async (query) => {
    if (!YOUTUBE_API_KEY) {
      console.warn('YouTube API key not set');
      return [];
    }
    try {
      const response = await fetch(
        `${API_ENDPOINTS.YOUTUBE_SEARCH}?part=snippet&type=video&videoCategoryId=10&q=${encodeURIComponent(query)}&key=${YOUTUBE_API_KEY}&maxResults=10`
      );
      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('YouTube search error:', error);
      return [];
    }
  }, []);

  // Handle search input
  const handleSearchInput = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 2) {
      setIsLoading(true);
      let results = [];

      if (currentSource === 'itunes') {
        results = await searchITunes(query);
      } else if (currentSource === 'youtube') {
        results = await searchYouTube(query);
      }

      setSearchResults(results);
      setIsLoading(false);
      setShowSearch(true);
    } else {
      setSearchResults([]);
      setShowSearch(false);
    }
  };

  // Play track
  const playTrack = (index, trackList = tracks) => {
    const track = trackList[index];
    if (!track) return;

    setCurrentTrackIndex(index);
    setIsLoading(true);

    const videoId = track.id?.videoId || track.id;
    playYouTubeVideo(videoId);
  };

  // Play YouTube video
  const playYouTubeVideo = (videoId) => {
    if (youtubePlayerRef.current) {
      youtubePlayerRef.current.loadVideoById(videoId);
    } else {
      youtubePlayerRef.current = new window.YT.Player('youtube-player', {
        height: '0',
        width: '0',
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
        },
        events: {
          onReady: (event) => {
            event.target.playVideo();
            setIsLoading(false);
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              setDuration(youtubePlayerRef.current.getDuration());
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
            } else if (event.data === window.YT.PlayerState.ENDED) {
              handleTrackEnd();
            }
          },
        },
      });
    }
  };

  // Toggle play/pause
  const togglePlay = () => {
    if (currentSource === 'youtube' && youtubePlayerRef.current) {
      if (isPlaying) {
        youtubePlayerRef.current.pauseVideo();
        setIsPlaying(false);
      } else {
        youtubePlayerRef.current.playVideo();
        setIsPlaying(true);
      }
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Previous track
  const prevTrack = () => {
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    let index = currentTrackIndex - 1;
    if (index < 0) index = tracks.length - 1;
    playTrack(index);
  };

  // Next track
  const nextTrack = () => {
    let index;
    if (isShuffle) {
      do {
        index = Math.floor(Math.random() * tracks.length);
      } while (index === currentTrackIndex && tracks.length > 1);
    } else {
      index = (currentTrackIndex + 1) % tracks.length;
    }
    playTrack(index);
  };

  // Handle track end
  const handleTrackEnd = () => {
    switch (repeatMode) {
      case 2: // repeat one
        if (currentSource === 'youtube' && youtubePlayerRef.current) {
          youtubePlayerRef.current.seekTo(0);
          youtubePlayerRef.current.playVideo();
        } else {
          audioRef.current.currentTime = 0;
          audioRef.current.play();
        }
        break;
      case 1: // repeat all
        nextTrack();
        break;
      default: // no repeat
        if (currentTrackIndex < tracks.length - 1) {
          nextTrack();
        } else {
          setIsPlaying(false);
          setCurrentTime(0);
        }
    }
  };

  // Toggle shuffle
  const toggleShuffle = () => {
    setIsShuffle(!isShuffle);
  };

  // Toggle repeat
  const toggleRepeat = () => {
    setRepeatMode((repeatMode + 1) % 3);
  };

  // Seek
  const seekTo = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));

    if (currentSource === 'youtube' && youtubePlayerRef.current) {
      youtubePlayerRef.current.seekTo(duration * pct);
    } else {
      audioRef.current.currentTime = duration * pct;
    }
    setCurrentTime(duration * pct);
  };

  // Set volume
  const setVolumeLevel = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newVolume = Math.round(pct * 100);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = pct;
    }
  };

  // Play song from voice command
  const playSongFromVoice = useCallback(async (songName) => {
    console.log('[MUSIC PLAYER playSongFromVoice] Called with:', songName);

    if (!songName || songName.trim().length === 0) {
      console.log('[MUSIC PLAYER] No song name provided');
      return;
    }

    console.log('[MUSIC PLAYER] Searching for:', songName);
    setIsLoading(true);

    // Search YouTube for the song
    console.log('[MUSIC PLAYER] Calling searchYouTube...');
    const results = await searchYouTube(songName + ' official audio');
    console.log('[MUSIC PLAYER] Search results:', results);

    if (results && results.length > 0) {
      const firstResult = results[0];
      const newTrack = {
        name: firstResult.snippet?.title || 'YouTube Track',
        artist: firstResult.snippet?.channelTitle || 'YouTube Artist',
        cover: firstResult.snippet?.thumbnails?.medium?.url,
        id: firstResult.id?.videoId || firstResult.id,
        duration: '--:--'
      };

      console.log('[MUSIC PLAYER] Found track:', newTrack);

      // Add to tracks and play
      const newTracks = [newTrack, ...tracks];
      setTracks(newTracks);
      setCurrentTrackIndex(0);

      // Directly play the YouTube video
      const videoId = newTrack.id?.videoId || newTrack.id;
      console.log('[MUSIC PLAYER] Playing video ID:', videoId);
      playYouTubeVideo(videoId);

      console.log('[MUSIC PLAYER] Playing:', newTrack.name);
    } else {
      console.log('[MUSIC PLAYER] No results found for:', songName);
      setIsLoading(false);
    }
  }, [tracks, searchYouTube]);

  // Expose API to parent ref for voice control
  useEffect(() => {
    if (playerApiRef) {
      console.log('[MUSIC PLAYER] Exposing API via ref');
      playerApiRef.current = {
        playSong: async (songName) => {
          console.log('[MUSIC PLAYER API] Received voice command:', songName);
          console.log('[MUSIC PLAYER API] playSongFromVoice exists:', !!playSongFromVoice);
          if (playSongFromVoice) {
            console.log('[MUSIC PLAYER API] Calling playSongFromVoice...');
            await playSongFromVoice(songName);
          } else {
            console.error('[MUSIC PLAYER API] playSongFromVoice is not available');
          }
        }
      };
      console.log('[MUSIC PLAYER] API exposed successfully');
    }
  }, [playerApiRef, playSongFromVoice]);

  // Select from search results
  const selectFromSearch = (result) => {
    let newTrack;

    newTrack = {
      name: result.snippet?.title || 'YouTube Track',
      artist: result.snippet?.channelTitle || 'YouTube Artist',
      cover: result.snippet?.thumbnails?.medium?.url,
      id: result.id?.videoId || result.id,
      duration: '--:--'
    };

    const newTracks = [newTrack, ...tracks];
    setTracks(newTracks);
    playTrack(0, newTracks);
    setShowSearch(false);
    setSearchQuery('');
  };

  // Format time
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  };

  // Get current track
  const currentTrack = tracks[currentTrackIndex] || {};

  return (
    <div
      className={`junior-player ${isPlaying ? 'playing' : ''}`}
      style={style}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {/* Hidden audio element */}
      <audio ref={audioRef} preload="none" />

      {/* Hidden YouTube player */}
      <div id="youtube-player" style={{ display: 'none' }} />

      {/* Header */}
      <div className="junior-player__header" onPointerDown={onPointerDown}>
        <div className="header-dot"></div>
        <span className="header-title">MUSIC CONTROL</span>
        <div className="header-dot"></div>
      </div>

      {/* Body */}
      <div className="junior-player__body">
        {/* Cover Art */}
        <div className="junior-player__cover-wrap">
          <div className="cover-glow"></div>
          <div className="junior-player__cover">
            {currentTrack.cover ? (
              <img
                src={currentTrack.cover}
                alt="Album Art"
              />
            ) : (
              <div className="cover-placeholder">🎵</div>
            )}
            <div className="cover-scanline"></div>
          </div>
          <div className="visualizer">
            <span></span><span></span><span></span><span></span><span></span>
            <span></span><span></span><span></span><span></span><span></span>
          </div>
        </div>

        {/* Track Info */}
        <div className="junior-player__info">
          <div className="track-name">{currentTrack.name || 'No Track Selected'}</div>
          <div className="track-artist">{currentTrack.artist || '---'}</div>
        </div>

        {/* Search Bar */}
        <div className="junior-player__search">
          <input
            type="text"
            placeholder="Search music..."
            value={searchQuery}
            onChange={handleSearchInput}
            onFocus={() => searchResults.length > 0 && setShowSearch(true)}
            className="junior-search-input"
          />
          <button
            className="search-toggle-btn"
            onClick={() => setShowSearch(!showSearch)}
          >
            🔍
          </button>
        </div>

        {/* Search Results */}
        {showSearch && searchResults.length > 0 && (
          <div className="junior-player__search-results">
            {searchResults.map((result, index) => {
              const title = currentSource === 'youtube'
                ? (result.snippet?.title || 'Unknown Track')
                : (result.trackName || result.trackCensoredName || 'Unknown Track');

              const artist = currentSource === 'youtube'
                ? (result.snippet?.channelTitle || 'YouTube Artist')
                : (result.artistName || 'Unknown Artist');

              const thumbnail = currentSource === 'youtube'
                ? (result.snippet?.thumbnails?.default?.url || 'https://via.placeholder.com/60')
                : (result.artworkUrl60 || 'https://via.placeholder.com/60');

              return (
                <div
                  key={index}
                  className="playlist-item"
                  onClick={() => selectFromSearch(result)}
                >
                  <span className="playlist-item__index">{String(index + 1).padStart(2, '0')}</span>
                  <img src={thumbnail} alt={title} className="result-art" />
                  <div className="playlist-item__info">
                    <div className="playlist-item__name">{title}</div>
                    <div className="playlist-item__artist">{artist}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Progress */}
        <div className="junior-player__progress">
          <span className="time-current">{formatTime(currentTime)}</span>
          <div className="progress-bar" onClick={seekTo}>
            <div
              className="progress-bar__fill"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            ></div>
            <div
              className="progress-bar__glow"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            ></div>
          </div>
          <span className="time-duration">{formatTime(duration)}</span>
        </div>

        {/* Controls */}
        <div className="junior-player__controls">
          <button
            className={`ctrl-btn ${isShuffle ? 'active' : ''}`}
            onClick={toggleShuffle}
            title="Shuffle"
          >
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
            </svg>
          </button>
          <button className="ctrl-btn" onClick={prevTrack} title="Previous">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>
          <button className="ctrl-btn ctrl-btn--play" onClick={togglePlay} title={isPlaying ? 'Pause' : 'Play'}>
            <svg viewBox="0 0 24 24" width="28" height="28" id="playIcon" style={{ display: isPlaying ? 'none' : 'block' }}>
              <path d="M8 5v14l11-7z" />
            </svg>
            <svg viewBox="0 0 24 24" width="28" height="28" id="pauseIcon" style={{ display: isPlaying ? 'block' : 'none' }}>
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          </button>
          <button className="ctrl-btn" onClick={nextTrack} title="Next">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </button>
          <button
            className={`ctrl-btn ${repeatMode > 0 ? 'active' : ''}`}
            onClick={toggleRepeat}
            title={repeatMode === 2 ? 'Repeat One' : repeatMode === 1 ? 'Repeat All' : 'No Repeat'}
            style={repeatMode === 2 ? { color: 'var(--jr-yellow)' } : {}}
          >
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
            </svg>
          </button>
        </div>

        {/* Volume */}
        <div className="junior-player__volume">
          <svg viewBox="0 0 24 24" width="14" height="14" className="vol-icon">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
          </svg>
          <div className="volume-bar" onClick={setVolumeLevel}>
            <div
              className="volume-bar__fill"
              style={{ width: `${volume}%` }}
            ></div>
          </div>
          <span className="volume-value">{volume}%</span>
        </div>
      </div>

      {/* Playlist */}
      <div className="junior-player__playlist">
        {tracks.map((track, i) => (
          <div
            key={i}
            className={`playlist-item ${i === currentTrackIndex ? 'active' : ''}`}
            onClick={() => playTrack(i)}
          >
            <span className="playlist-item__index">{String(i + 1).padStart(2, '0')}</span>
            {track.cover && (
              <img src={track.cover} alt={track.name} className="result-art" />
            )}
            <div className="playlist-item__info">
              <div className="playlist-item__name">{track.name}</div>
              <div className="playlist-item__artist">{track.artist}</div>
            </div>
            <span className="playlist-item__duration">{track.duration || '--:--'}</span>
          </div>
        ))}
      </div>
      <ResizeHandle
        onResize={onResize}
        width={config?.width}
        height={config?.height}
      />
    </div>
  );
};

export default JuniorMusicPlayer;
