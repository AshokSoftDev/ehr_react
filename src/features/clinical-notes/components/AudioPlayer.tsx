import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AudioPlayerProps {
  src: string;
  className?: string;
}

const formatTime = (seconds: number) => {
  if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export function AudioPlayer({ src, className }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handlePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newTime = (parseFloat(e.target.value) / 100) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  }, [duration]);

  const handleSeekClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    const newTime = clickPosition * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  }, [duration]);

  const handleSkip = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(duration, audio.currentTime + seconds));
  }, [duration]);

  const handleRestart = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    setCurrentTime(0);
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newVolume = parseFloat(e.target.value) / 100;
    audio.volume = newVolume;
    setVolume(newVolume);
    if (newVolume === 0) {
      setIsMuted(true);
      audio.muted = true;
    } else if (isMuted) {
      setIsMuted(false);
      audio.muted = false;
    }
  }, [isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };
    const handleEnded = () => setIsPlaying(false);
    const handleCanPlay = () => setIsLoading(false);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("canplay", handleCanPlay);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("canplay", handleCanPlay);
    };
  }, []);

  return (
    <div className={cn(
      "rounded-xl bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-fuchsia-500/10",
      "border border-violet-500/20 p-3",
      className
    )}>
      <audio ref={audioRef} src={src} preload="metadata" />
      
      {/* Waveform Visualization */}
      <div 
        className="relative h-12 mb-3 rounded-lg overflow-hidden bg-gradient-to-r from-violet-500/20 via-purple-500/30 to-fuchsia-500/20 cursor-pointer"
        onClick={handleSeekClick}
      >
        {/* Progress Overlay */}
        <div 
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-500/50 via-purple-500/60 to-fuchsia-500/50 transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
        
        {/* Animated Bars */}
        <div className="absolute inset-0 flex items-center justify-around px-1">
          {[...Array(40)].map((_, i) => {
            // Create a wave pattern
            const baseHeight = 35 + Math.sin(i * 0.4) * 25;
            return (
              <div
                key={i}
                className={cn(
                  "w-[3px] rounded-full transition-all duration-300",
                  i / 40 * 100 < progress 
                    ? "bg-white/90" 
                    : "bg-violet-400/50"
                )}
                style={{ 
                  height: `${baseHeight + (isPlaying ? Math.sin(Date.now() / 200 + i) * 10 : 0)}%`,
                }}
              />
            );
          })}
        </div>
        
        {/* Invisible seek slider */}
        <input
          type="range"
          value={progress}
          onChange={handleSeek}
          min="0"
          max="100"
          step="0.1"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>

      {/* Time Display */}
      <div className="flex items-center justify-between text-[10px] font-medium text-violet-600 dark:text-violet-400 mb-2 px-1">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-1">
        {/* Restart */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRestart}
          className="h-8 w-8 p-0 rounded-full hover:bg-violet-500/20 text-violet-600 dark:text-violet-400"
          title="Restart"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>

        {/* Skip Back */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleSkip(-10)}
          className="h-8 w-8 p-0 rounded-full hover:bg-violet-500/20 text-violet-600 dark:text-violet-400"
          title="Skip back 10s"
        >
          <SkipBack className="h-3.5 w-3.5" />
        </Button>

        {/* Play/Pause */}
        <Button
          size="sm"
          onClick={handlePlayPause}
          disabled={isLoading}
          className={cn(
            "h-10 w-10 p-0 rounded-full shadow-lg",
            "bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500",
            "hover:from-violet-600 hover:via-purple-600 hover:to-fuchsia-600",
            "text-white transition-all duration-200",
            isPlaying && "ring-2 ring-purple-400/50 ring-offset-2 ring-offset-background"
          )}
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4 fill-current" />
          ) : (
            <Play className="h-4 w-4 fill-current ml-0.5" />
          )}
        </Button>

        {/* Skip Forward */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleSkip(10)}
          className="h-8 w-8 p-0 rounded-full hover:bg-violet-500/20 text-violet-600 dark:text-violet-400"
          title="Skip forward 10s"
        >
          <SkipForward className="h-3.5 w-3.5" />
        </Button>

        {/* Volume */}
        <div className="flex items-center gap-1 ml-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMute}
            className="h-8 w-8 p-0 rounded-full hover:bg-violet-500/20 text-violet-600 dark:text-violet-400"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="h-3.5 w-3.5" />
            ) : (
              <Volume2 className="h-3.5 w-3.5" />
            )}
          </Button>
          <input
            type="range"
            value={isMuted ? 0 : volume * 100}
            onChange={handleVolumeChange}
            min="0"
            max="100"
            step="1"
            className="w-16 h-1 bg-violet-200 dark:bg-violet-800 rounded-full appearance-none cursor-pointer accent-violet-500"
            title="Volume"
          />
        </div>
      </div>
    </div>
  );
}
