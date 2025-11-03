import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
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
    <div className="space-y-4">
      {/* Status + Timer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`h-3 w-3 rounded-full ${status === 'recording' ? 'bg-red-500 animate-pulse' : status === 'paused' ? 'bg-yellow-500' : 'bg-muted-foreground/40'}`} />
          <span className="text-sm font-medium">
            {status === 'recording' && 'Recording'}
            {status === 'paused' && 'Paused'}
            {status === 'idle' && 'Idle'}
            {status === 'stopped' && 'Recorded'}
          </span>
        </div>
        <div className="font-mono text-lg">{fmt}</div>
      </div>

      {/* Equalizer animation */}
      <div className="h-10 flex items-end gap-1">
        {levels.map((h, idx) => (
          <div key={idx} className={`w-1.5 rounded-sm ${status === 'recording' ? 'bg-primary' : 'bg-muted'}`} style={{ height: `${h}px` }} />
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {status === 'idle' && (
          <Button onClick={startRecording} className="gap-2">
            <Mic className="h-4 w-4" /> Start
          </Button>
        )}
        {status === 'recording' && (
          <>
            <Button variant="secondary" onClick={pauseRecording} className="gap-2">
              <PauseCircle className="h-4 w-4" /> Pause
            </Button>
            <Button variant="destructive" onClick={stopRecording} className="gap-2">
              <Square className="h-4 w-4" /> Stop
            </Button>
          </>
        )}
        {status === 'paused' && (
          <>
            <Button onClick={resumeRecording} className="gap-2">
              <PlayCircle className="h-4 w-4" /> Resume
            </Button>
            <Button variant="destructive" onClick={stopRecording} className="gap-2">
              <Square className="h-4 w-4" /> Stop
            </Button>
          </>
        )}
        {(status === 'stopped' || audioUrl) && (
          <Button variant="outline" onClick={resetRecording} className="gap-2">
            <Trash2 className="h-4 w-4" /> Discard
          </Button>
        )}
      </div>

      {/* Preview */}
      {audioUrl && (
        <div className="rounded-md border bg-card p-3 flex items-center gap-3">
          <audio controls src={audioUrl} />
        </div>
      )}

      {error && <div className="text-sm text-destructive">{error}</div>}
      <Separator />
      <div className="text-xs text-muted-foreground">Recordings are captured in-browser (audio/webm). Use the Save button above to handle upload (currently logged in console).</div>
    </div>
  );
};

export default DictationRecorder;

