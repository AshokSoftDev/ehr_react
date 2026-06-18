import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

type MedicalNoteEditorHandle = {
  getContent: () => string;
  setContent: (html: string) => void;
};

export const MEDICAL_NOTE_PLACEHOLDER = '<p><em>Click into the editor and start typing...</em></p>';

const SECTION_TEMPLATES: Record<string, string> = {
  CC: '<h3>Chief Complaint</h3><p></p>',
  HPI: '<h3>History of Present Illness</h3><ul><li>Onset:</li><li>Location:</li><li>Duration:</li><li>Characteristics:</li><li>Aggravating factors:</li><li>Relieving factors:</li><li>Timing:</li><li>Severity:</li></ul>',
  ROS: '<h3>Review of Systems</h3><ul><li>General:</li><li>HEENT:</li><li>CVS:</li><li>Respiratory:</li><li>GI:</li><li>GU:</li><li>Neuro:</li><li>MSK:</li><li>Derm:</li></ul>',
  PE: '<h3>Physical Examination</h3><ul><li>Vitals:</li><li>General:</li><li>HEENT:</li><li>Chest:</li><li>CVS:</li><li>Abdomen:</li><li>Extremities:</li><li>Neuro:</li></ul>',
  ASSESSMENT: '<h3>Assessment</h3><p>...</p>',
  PLAN: '<h3>Plan</h3><ul><li>Medications:</li><li>Investigations:</li><li>Referrals:</li><li>Follow-up:</li></ul>',
};

function applyFormat(cmd: string, value?: string) {
  document.execCommand(cmd, false, value);
}

const MedicalNoteEditor = forwardRef<MedicalNoteEditorHandle, { className?: string }>((props, ref) => {
  const { className } = props;
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [html, setHtml] = useState<string>(MEDICAL_NOTE_PLACEHOLDER);
  const htmlRef = useRef<string>(html);
  const externalSetRef = useRef(false);
  const rangeRef = useRef<Range | null>(null);
  const [active, setActive] = useState({ bold: false, italic: false, underline: false, ul: false, ol: false });

  useImperativeHandle(ref, () => ({
    getContent: () => editorRef.current?.innerHTML || htmlRef.current || html,
    setContent: (h: string) => {
      externalSetRef.current = true;
      setHtml(h);
    },
  }), [html]);

  // Initialize or update content only when external set is requested
  useEffect(() => {
    if (!editorRef.current) return;
    if (externalSetRef.current) {
      editorRef.current.innerHTML = html;
      htmlRef.current = html;
      externalSetRef.current = false;
      return;
    }
    // Initial mount only
    if (editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = html;
      htmlRef.current = html;
    }
  }, [html]);

  const isSelectionInsideEditor = () => {
    const sel = window.getSelection();
    const ed = editorRef.current;
    if (!sel || !ed || sel.rangeCount === 0) return false;
    const node = sel.anchorNode as Node | null;
    return !!(node && ed.contains(node));
  };

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && isSelectionInsideEditor()) {
      rangeRef.current = sel.getRangeAt(0);
    }
  };

  const restoreSelection = () => {
    const ed = editorRef.current;
    const sel = window.getSelection();
    if (!ed || !sel || !rangeRef.current) return;
    ed.focus();
    sel.removeAllRanges();
    sel.addRange(rangeRef.current);
  };

  const updateToolbarStates = () => {
    try {
      setActive({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        ul: document.queryCommandState('insertUnorderedList'),
        ol: document.queryCommandState('insertOrderedList'),
      });
    } catch {
      // ignore
    }
  };

  const insertTemplate = (key: keyof typeof SECTION_TEMPLATES) => {
    const tpl = SECTION_TEMPLATES[key];
    restoreSelection();
    editorRef.current?.focus();
    applyFormat('insertHTML', tpl);
    updateToolbarStates();
  };

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex flex-wrap items-center gap-1">
        <div className="flex items-center gap-0.5">
          <Button
            type="button"
            variant={active.bold ? 'default' : 'outline'}
            size="sm"
            className={cn('h-7 w-7 p-0 text-xs font-bold', active.bold && 'bg-primary text-primary-foreground')}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => { restoreSelection(); applyFormat('bold'); updateToolbarStates(); }}
          >
            B
          </Button>
          <Button
            type="button"
            variant={active.italic ? 'default' : 'outline'}
            size="sm"
            className={cn('h-7 w-7 p-0 text-xs italic', active.italic && 'bg-primary text-primary-foreground')}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => { restoreSelection(); applyFormat('italic'); updateToolbarStates(); }}
          >
            I
          </Button>
          <Button
            type="button"
            variant={active.underline ? 'default' : 'outline'}
            size="sm"
            className={cn('h-7 w-7 p-0 text-xs underline', active.underline && 'bg-primary text-primary-foreground')}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => { restoreSelection(); applyFormat('underline'); updateToolbarStates(); }}
          >
            U
          </Button>
          <Button
            type="button"
            variant={active.ul ? 'default' : 'outline'}
            size="sm"
            className={cn('h-7 px-1.5 text-[10px]', active.ul && 'bg-primary text-primary-foreground')}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => { restoreSelection(); applyFormat('insertUnorderedList'); updateToolbarStates(); }}
          >
            •
          </Button>
          <Button
            type="button"
            variant={active.ol ? 'default' : 'outline'}
            size="sm"
            className={cn('h-7 px-1.5 text-[10px]', active.ol && 'bg-primary text-primary-foreground')}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => { restoreSelection(); applyFormat('insertOrderedList'); updateToolbarStates(); }}
          >
            1.
          </Button>
        </div>
        <Separator orientation="vertical" className="h-5 mx-1" />
        <div className="flex items-center gap-0.5 flex-wrap">
          <Button type="button" variant="ghost" size="sm" className="h-6 px-1.5 text-[10px]" onClick={() => insertTemplate('CC')}>CC</Button>
          <Button type="button" variant="ghost" size="sm" className="h-6 px-1.5 text-[10px]" onClick={() => insertTemplate('HPI')}>HPI</Button>
          <Button type="button" variant="ghost" size="sm" className="h-6 px-1.5 text-[10px]" onClick={() => insertTemplate('ROS')}>ROS</Button>
          <Button type="button" variant="ghost" size="sm" className="h-6 px-1.5 text-[10px]" onClick={() => insertTemplate('PE')}>PE</Button>
          <Button type="button" variant="ghost" size="sm" className="h-6 px-1.5 text-[10px]" onClick={() => insertTemplate('ASSESSMENT')}>A</Button>
          <Button type="button" variant="ghost" size="sm" className="h-6 px-1.5 text-[10px]" onClick={() => insertTemplate('PLAN')}>P</Button>
        </div>
      </div>
      <div className="h-[280px] rounded-md border border-border bg-card overflow-y-auto">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          className="editor-content min-h-full px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring [&>h1]:text-base [&>h2]:text-sm [&>h3]:text-xs [&>h3]:font-semibold [&>p]:text-sm [&>ul]:text-sm [&>ol]:text-sm [&>li]:text-sm"
          onInput={(e) => {
            htmlRef.current = (e.target as HTMLDivElement).innerHTML;
          }}
          onKeyUp={() => { saveSelection(); updateToolbarStates(); }}
          onMouseUp={() => { saveSelection(); updateToolbarStates(); }}
          onFocus={(e) => {
            if (e.target.innerHTML === MEDICAL_NOTE_PLACEHOLDER) {
              e.target.innerHTML = '<p><br></p>';
              htmlRef.current = '<p><br></p>';
            }
          }}
          onBlur={(e) => {
            const content = e.target.innerHTML.trim();
            if (!content || content === '<p><br></p>' || content === '<p></p>') {
              e.target.innerHTML = MEDICAL_NOTE_PLACEHOLDER;
              htmlRef.current = MEDICAL_NOTE_PLACEHOLDER;
            }
          }}
        />
      </div>
    </div>
  );
});

export default MedicalNoteEditor;
