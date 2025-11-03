import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "react-router-dom";
import MedicalNoteEditor from "../../components/MedicalNoteEditor";
import DictationRecorder from "../../components/DictationRecorder";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";

export function PatientClinicalNotesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'text';

  const editorRef = useRef<{ getContent: () => string; setContent: (html: string) => void } | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const onSave = () => {
    if (mode === 'text') {
      const html = editorRef.current?.getContent() ?? '';
      // For now, just print to console
      // eslint-disable-next-line no-console
      console.log({ type: 'clinical-note', format: 'html', data: html });
    } else {
      // Dictation mode
      // eslint-disable-next-line no-console
      console.log({ type: 'dictation', format: 'audio/webm', size: audioBlob?.size ?? 0, blob: audioBlob });
    }
  };

  return (
    <Card className="bg-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Clinical Notes</CardTitle>
        <div className="flex items-center gap-2">
          <Button onClick={onSave}>Save</Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs
          value={mode}
          onValueChange={(val) => {
            const next = new URLSearchParams(searchParams);
            next.set('mode', val);
            setSearchParams(next, { replace: true });
          }}
        >
          <TabsList className="bg-muted/30">
            <TabsTrigger value="text" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Text</TabsTrigger>
            <TabsTrigger value="dictate" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Dictate</TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="mt-4">
            <MedicalNoteEditor ref={editorRef} />
          </TabsContent>

          <TabsContent value="dictate" className="mt-4">
            <DictationRecorder onRecorded={(blob) => setAudioBlob(blob)} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default PatientClinicalNotesPage;
