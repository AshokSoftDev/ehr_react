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
  const [levels, setLevels] = useState<number[]>([2, 8, 14, 10, 6, 12, 4]);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (timerRef.current) window.clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [audioUrl]);

  useEffect(() => {
    if (status === 'recording') {
      const id = window.setInterval(() => {
        setLevels(prev => prev.map(() => Math.floor(Math.random() * 14) + 2));
      }, 180);
      return () => window.clearInterval(id);
    }
    return;
  }, [status]);

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
      <div className={`rounded-lg border p-3 transition-all ${
        status === 'recording' 
          ? 'bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-red-200 dark:border-red-800' 
          : status === 'paused'
          ? 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 border-yellow-200 dark:border-yellow-800'
          : 'bg-muted/30 border-border'
      }`}>
        {/* Status + Timer */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${
              status === 'recording' ? 'bg-red-500 animate-pulse' : 
              status === 'paused' ? 'bg-yellow-500 animate-[pulse_2s_ease-in-out_infinite]' : 
              status === 'stopped' ? 'bg-green-500' :
              'bg-muted-foreground/40'
            }`} />
            <span className={`text-xs font-medium ${
              status === 'recording' ? 'text-red-600 dark:text-red-400' : 
              status === 'paused' ? 'text-yellow-600 dark:text-yellow-400' : 
              'text-muted-foreground'
            }`}>
              {status === 'recording' && 'Recording...'}
              {status === 'paused' && 'Paused'}
              {status === 'idle' && 'Ready to record'}
              {status === 'stopped' && 'Recording complete'}
            </span>
          </div>
          <div className={`font-mono text-sm font-semibold ${
            status === 'recording' ? 'text-red-600 dark:text-red-400' : 'text-foreground'
          }`}>{fmt}</div>
        </div>

        {/* Enhanced Equalizer Animation */}
        <div className="h-12 flex items-center justify-center gap-[3px] px-2">
          {levels.map((h, idx) => (
            <div 
              key={idx} 
              className={`w-1.5 rounded-full transition-all duration-150 ${
                status === 'recording' 
                  ? 'bg-gradient-to-t from-red-500 via-orange-400 to-yellow-300' 
                  : status === 'paused'
                  ? 'bg-gradient-to-t from-yellow-500 to-yellow-300'
                  : 'bg-muted-foreground/20'
              }`} 
              style={{ 
                height: `${status === 'recording' || status === 'paused' ? h * 2.5 : 4}px`,
                opacity: status === 'recording' ? 1 : 0.5
              }} 
            />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {status === 'idle' && (
          <Button onClick={startRecording} size="sm" className="gap-1.5 h-8">
            <Mic className="h-3.5 w-3.5" /> Start Recording
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
        {(status === 'stopped' || audioUrl) && (
          <Button variant="ghost" size="sm" onClick={resetRecording} className="gap-1.5 h-8 text-destructive hover:text-destructive">
            <Trash2 className="h-3.5 w-3.5" /> Discard
          </Button>
        )}
      </div>

      {/* Audio Preview */}
      {audioUrl && (
        <div className="rounded-lg border bg-card p-2">
          <audio controls src={audioUrl} className="w-full h-8" />
        </div>
      )}

      {error && <div className="text-xs text-destructive">{error}</div>}
    </div>
  );
};

export default DictationRecorder;

