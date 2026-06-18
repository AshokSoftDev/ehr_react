import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, PauseCircle, PlayCircle, Trash2 } from 'lucide-react';

type DictationRecorderProps = {
  onRecorded?: (blob: Blob | null) => void;
};

const DictationRecorder: React.FC<DictationRecorderProps> = ({ onRecorded }) => {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const [status, setStatus] = useState<'idle' | 'recording' | 'paused' | 'stopped'>('idle');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const timerRef = useRef<number | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const [levels, setLevels] = useState<number[]>(new Array(16).fill(2));

  // Web Audio API refs for real audio visualization
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      audioContextRef.current?.close();
    };
  }, [audioUrl]);

  // Real-time audio level visualization using Web Audio API
  const startAudioVisualization = (stream: MediaStream) => {
    try {
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);

      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.3;
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateLevels = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);

          // Map frequency data to 16 bars for smoother waveform
          const barCount = 16;
          const step = Math.floor(dataArray.length / barCount);
          const newLevels = Array.from({ length: barCount }, (_, i) => {
            const value = dataArray[i * step] || 0;
            // More sensitive scaling - min 3, max 40
            return Math.max(3, Math.min(40, Math.floor((value / 255) * 45)));
          });

          setLevels(newLevels);
          animationFrameRef.current = requestAnimationFrame(updateLevels);
        }
      };

      updateLevels();
    } catch (err) {
      console.error('Audio visualization failed:', err);
    }
  };

  const stopAudioVisualization = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    analyserRef.current = null;
    setLevels(new Array(16).fill(2));
  };

  const fmt = useMemo(() => {
    const sec = Math.floor(elapsedMs / 1000);
    const mm = String(Math.floor(sec / 60)).padStart(2, '0');
    const ss = String(sec % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  }, [elapsedMs]);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Start real-time audio visualization
      startAudioVisualization(stream);

      let mr: MediaRecorder;
      try {
        mr = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      } catch {
        mr = new MediaRecorder(stream);
      }
      chunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        onRecorded?.(blob);
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        stopAudioVisualization();
        audioContextRef.current?.close();
        audioContextRef.current = null;
      };

      mediaRecorderRef.current = mr;
      mr.start();
      setStatus('recording');
      startedAtRef.current = Date.now();
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = window.setInterval(() => {
        const base = startedAtRef.current ?? Date.now();
        setElapsedMs(Date.now() - base);
      }, 200);
    } catch (e: any) {
      setError(e?.message || 'Microphone access denied');
    }
  };

  const stopRecording = () => {
    try {
      mediaRecorderRef.current?.stop();
      setStatus('stopped');
    } finally {
      if (timerRef.current) window.clearInterval(timerRef.current);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      if (startedAtRef.current) setElapsedMs(Date.now() - startedAtRef.current);
      setStatus('paused');
      if (timerRef.current) window.clearInterval(timerRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      startedAtRef.current = Date.now() - elapsedMs;
      setStatus('recording');
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = window.setInterval(() => {
        const base = startedAtRef.current ?? Date.now();
        setElapsedMs(Date.now() - base);
      }, 200);
    }
  };

  const resetRecording = () => {
    setStatus('idle');
    setElapsedMs(0);
    startedAtRef.current = null;
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    chunksRef.current = [];
    onRecorded?.(null);
  };

  return (
    <div className="space-y-3">
      {/* Recording Status Card */}
      {(status === 'recording' || status === 'paused') && (
        <div className={`rounded-lg border p-3 transition-all ${status === 'recording'
          ? 'bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-red-200 dark:border-red-800'
          : 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 border-yellow-200 dark:border-yellow-800'
          }`}>
          {/* Status + Timer */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${status === 'recording' ? 'bg-red-500 animate-pulse' : 'bg-yellow-500 animate-[pulse_2s_ease-in-out_infinite]'}`} />
              <span className={`text-xs font-medium ${status === 'recording' ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                {status === 'recording' && 'Recording...'}
                {status === 'paused' && 'Paused'}
              </span>
            </div>
            <div className={`font-mono text-sm font-semibold ${status === 'recording' ? 'text-red-600 dark:text-red-400' : 'text-foreground'}`}>{fmt}</div>
          </div>

          {/* Waveform Animation */}
          <div className="h-14 flex items-center justify-center gap-[2px] px-2">
            {levels.map((h, idx) => (
              <div
                key={idx}
                className={`w-[3px] rounded-full ${status === 'recording'
                  ? 'bg-gradient-to-t from-red-500 via-rose-400 to-pink-300'
                  : status === 'paused'
                    ? 'bg-gradient-to-t from-amber-500 to-yellow-300'
                    : 'bg-muted-foreground/20'
                  }`}
                style={{
                  height: `${status === 'recording' ? h : status === 'paused' ? h * 0.6 : 4}px`,
                  opacity: status === 'recording' ? 0.9 + (h / 200) : 0.4,
                  transform: status === 'recording' ? `scaleY(${0.9 + (h / 300)})` : 'scaleY(1)',
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-2">
        {status === 'idle' && (
          <Button onClick={startRecording} size="sm" className="gap-1.5 h-8">
            <Mic className="h-3.5 w-3.5" /> Click here to Start Recording
          </Button>
        )}
        {status === 'recording' && (
          <>
            <Button variant="secondary" size="sm" onClick={pauseRecording} className="gap-1.5 h-8">
              <PauseCircle className="h-3.5 w-3.5" /> Pause
            </Button>
            <Button variant="destructive" size="sm" onClick={stopRecording} className="gap-1.5 h-8">
              <Square className="h-3.5 w-3.5" /> Stop
            </Button>
          </>
        )}
        {status === 'paused' && (
          <>
            <Button size="sm" onClick={resumeRecording} className="gap-1.5 h-8">
              <PlayCircle className="h-3.5 w-3.5" /> Resume
            </Button>
            <Button variant="destructive" size="sm" onClick={stopRecording} className="gap-1.5 h-8">
              <Square className="h-3.5 w-3.5" /> Stop
            </Button>
          </>
        )}
      </div>

      {/* Audio Preview */}
      {audioUrl && (
        <div className="flex items-center gap-2 rounded-lg border bg-card p-2">
          <audio controls controlsList="nodownload noplaybackrate" src={audioUrl} className="flex-1 h-8" />
          <Button variant="ghost" size="icon" onClick={resetRecording} className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0" title="Discard">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}

      {error && <div className="text-xs text-destructive">{error}</div>}
    </div>
  );
};

export default DictationRecorder;

