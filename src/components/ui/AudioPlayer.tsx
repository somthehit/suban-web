"use client";

import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX, Download, Disc, Sparkles } from "lucide-react";

export interface AudioTrack {
  id: string;
  title: string;
  type: string;
  streamPath?: string | null;
  previewPath?: string | null;
  originalPath?: string | null;
  waveformJson?: number[] | string | null;
  spectrogramPath?: string | null;
  duration: string | number;
  recordedAt?: string | null;
  locationLabel?: string | null;
  recorder?: string | null;
  microphone?: string | null;
  quality?: string | null;
  soundDescription?: string | null;
  isFree?: boolean;
}

interface AudioPlayerProps {
  track: AudioTrack;
  compact?: boolean;
  className?: string;
}

export function AudioPlayer({ track, compact = false, className = "" }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState<number>(Number(track.duration) || 0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [isLooping, setIsLooping] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showSpectrogram, setShowSpectrogram] = useState(false);

  // Parse waveform data (100 normalized points between 0.05 and 1.0)
  const waveform: number[] = React.useMemo(() => {
    if (Array.isArray(track.waveformJson) && track.waveformJson.length > 0) {
      return track.waveformJson.map((v) => Number(v));
    }
    if (typeof track.waveformJson === "string") {
      try {
        const parsed = JSON.parse(track.waveformJson);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((v) => Number(v));
        }
      } catch {}
    }
    // Deterministic pseudo-waveform fallback if not precomputed
    const seed = track.title.length + 7;
    return Array.from({ length: compact ? 36 : 64 }, (_, i) => {
      const val = Math.abs(Math.sin((i * 11 + seed) * 0.2) * 0.7 + Math.cos(i * 0.4) * 0.3);
      return Math.max(0.12, Math.min(0.95, val));
    });
  }, [track.waveformJson, track.title, compact]);

  const audioSrc = track.streamPath || track.previewPath || "/audio/sample-bird.mp3";

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const onEnded = () => {
      if (!isLooping) setIsPlaying(false);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, [isLooping]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleSeek = (ratio: number) => {
    const audio = audioRef.current;
    if (!audio || duration === 0) return;
    const target = ratio * duration;
    audio.currentTime = target;
    setCurrentTime(target);
  };

  const cycleSpeed = () => {
    const speeds = [0.75, 1.0, 1.25];
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setPlaybackRate(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const formatSeconds = (sec: number) => {
    if (isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const progressRatio = duration > 0 ? currentTime / duration : 0;

  return (
    <div
      className={`rounded-2xl border border-slate-200 dark:border-[#00ffcc]/20 bg-white dark:bg-gradient-to-b dark:from-[#0a2315]/90 dark:to-[#04120a]/95 backdrop-blur-md p-4 sm:p-5 shadow-sm dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all ${className}`}
    >
      <audio
        ref={audioRef}
        src={audioSrc}
        loop={isLooping}
        muted={isMuted}
        preload="metadata"
      />

      {/* Header Info */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-[#008769]/10 text-[#008769] border border-[#008769]/25 dark:bg-[#00ffcc]/15 dark:text-[#00ffcc] dark:border-[#00ffcc]/30 font-semibold">
              {track.type || "Soundscape"}
            </span>
            {track.quality && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30">
                Grade {track.quality}
              </span>
            )}
            {track.locationLabel && (
              <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                📍 {track.locationLabel}
              </span>
            )}
          </div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white tracking-wide truncate mt-1">
            {track.title}
          </h4>
        </div>

        {/* Spectrogram & Loop Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {track.spectrogramPath && (
            <button
              onClick={() => setShowSpectrogram(!showSpectrogram)}
              title="Toggle bioacoustic spectrogram"
              className={`p-1.5 rounded-lg border text-xs transition-colors ${
                showSpectrogram
                  ? "bg-[#008769]/15 border-[#008769] text-[#008769] dark:bg-[#00ffcc]/20 dark:border-[#00ffcc] dark:text-[#00ffcc]"
                  : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => setIsLooping(!isLooping)}
            title="Loop playback"
            className={`p-1.5 rounded-lg border text-xs transition-colors ${
              isLooping
                ? "bg-[#008769]/15 border-[#008769] text-[#008769] dark:bg-[#00ffcc]/20 dark:border-[#00ffcc] dark:text-[#00ffcc]"
                : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={cycleSpeed}
            className="px-2 py-1 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-[11px] font-mono text-slate-700 dark:text-slate-300 hover:border-[#008769]/40 dark:hover:border-[#00ffcc]/40 transition-colors"
            title="Adjust playback speed"
          >
            {playbackRate}x
          </button>
        </div>
      </div>

      {/* Spectrogram Display (if active) */}
      {showSpectrogram && track.spectrogramPath && (
        <div className="mb-3 rounded-lg overflow-hidden border border-slate-200 dark:border-[#00ffcc]/30 bg-slate-50 dark:bg-black/40 p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={track.spectrogramPath}
            alt="Audio Spectrogram"
            className="w-full h-20 object-cover rounded opacity-80"
          />
        </div>
      )}

      {/* Waveform Scrubber Visualizer */}
      <div
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          handleSeek(Math.max(0, Math.min(1, clickX / rect.width)));
        }}
        className="group relative h-12 w-full cursor-pointer flex items-end justify-between gap-[2px] px-1 py-1 rounded-lg bg-slate-100 dark:bg-black/40 hover:bg-slate-200/80 dark:hover:bg-black/60 transition-colors"
      >
        {waveform.map((peak, idx) => {
          const barRatio = idx / waveform.length;
          const isPassed = barRatio <= progressRatio;
          const heightPercent = Math.max(15, Math.round(peak * 100));

          return (
            <div
              key={idx}
              style={{ height: `${heightPercent}%` }}
              className={`flex-1 rounded-full transition-all duration-75 ${
                isPassed
                  ? "bg-gradient-to-t from-[#008769] to-[#10b981] dark:from-[#00ffcc] dark:to-[#38ef7d] shadow-[0_0_6px_rgba(0,135,105,0.3)] dark:shadow-[0_0_8px_rgba(0,255,204,0.4)]"
                  : "bg-slate-300 dark:bg-white/20 group-hover:bg-slate-400 dark:group-hover:bg-white/30"
              }`}
            />
          );
        })}

        {/* Current Playhead Line */}
        <div
          style={{ left: `${progressRatio * 100}%` }}
          className="absolute top-0 bottom-0 w-[2px] bg-slate-900 dark:bg-white pointer-events-none shadow-[0_0_4px_rgba(0,0,0,0.4)] dark:shadow-[0_0_6px_#ffffff]"
        />
      </div>

      {/* Bottom Transport Bar */}
      <div className="flex items-center justify-between gap-3 mt-3">
        {/* Play/Pause Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-[#008769] to-[#10b981] text-white dark:from-[#00ffcc] dark:to-[#38ef7d] dark:text-[#04120a] font-bold shadow-md hover:scale-105 active:scale-95 transition-all"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current translate-x-0.5" />
            )}
          </button>

          <span className="text-xs font-mono text-slate-700 dark:text-slate-300">
            {formatSeconds(currentTime)}{" "}
            <span className="text-slate-400 dark:text-slate-500">/</span> {formatSeconds(duration)}
          </span>
        </div>

        {/* Mute & Download */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <a
            href={`/api/audio/download?trackId=${track.id}`}
            download
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-[#008769]/10 text-slate-700 hover:text-[#008769] border border-slate-200 hover:border-[#008769]/30 dark:bg-white/5 dark:hover:bg-[#00ffcc]/15 dark:text-slate-300 dark:hover:text-[#00ffcc] dark:border-white/10 dark:hover:border-[#00ffcc]/30 transition-all font-semibold"
          >
            <Download className="w-3.5 h-3.5" />
            <span>HQ Audio</span>
          </a>
        </div>
      </div>
    </div>
  );
}
