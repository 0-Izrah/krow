import { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { parsePastedRoutine } from '../../utils/routineParser';

export function PasteRoutineModal({ onClose, onSave, exercises }) {
    const [pastedText, setPastedText] = useState("");
    const [previewLine, setPreviewLine] = useState(null);

    const handlePreview = () => {
        if (!pastedText.trim()) return;
        const result = parsePastedRoutine(pastedText, exercises);
        setPreviewLine(result);
    };

    const handleSave = () => {
        if (previewLine) {
            onSave(previewLine);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-grind-dark border-grind-gray p-6 flex flex-col gap-4">
                <h2 className="text-xl font-black text-white uppercase tracking-wider">Paste Routine</h2>
                
                {!previewLine ? (
                    <>
                        <p className="text-xs text-grind-muted">Paste your routine notes here. Example:<br/>Push Day<br/>Bench Press 3x10<br/>Tricep Pushdowns 4x12</p>
                        <textarea 
                            className="w-full h-48 bg-black border border-grind-gray rounded-md p-3 text-white text-sm shrink-0"
                            value={pastedText}
                            onChange={(e) => setPastedText(e.target.value)}
                            placeholder="Paste your text here..."
                        />
                        <div className="flex justify-end gap-2 mt-2">
                            <Button variant="ghost" onClick={onClose} className="px-6 border border-grind-gray h-12 uppercase font-bold tracking-widest text-[#B3B3B3] hover:text-white hover:border-grind-accent/50 transition-colors">Cancel</Button>
                            <Button variant="primary" onClick={handlePreview} className="px-6 h-12 uppercase font-black tracking-widest shadow-[0_0_15px_rgba(200,255,0,0.2)]">Preview</Button>
                        </div>
                    </>
                ) : (
                    <>
                        <p className="text-xs text-grind-muted">Previewing: <span className="text-grind-accent font-bold">{previewLine.name}</span></p>
                        <div className="bg-black p-3 rounded border border-grind-gray max-h-48 overflow-y-auto w-full text-sm">
                            {previewLine.exercises.map((ex, i) => (
                                <div key={i} className="mb-2 pb-2 border-b border-grind-gray/30 last:border-0 last:pb-0 last:mb-0">
                                    <h4 className="text-white font-bold">{ex.importedName} {ex.matchedName ? <span className="text-grind-accent text-[10px] uppercase ml-2 bg-grind-accent/10 px-1 py-0.5 rounded">Matched to lib</span> : <span className="text-red-500 text-[10px] uppercase ml-2 bg-red-500/10 px-1 py-0.5 rounded">Unmatched</span>}</h4>
                                    <p className="text-grind-muted text-xs">{ex.plannedSets} sets x {ex.targetReps} reps</p>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end gap-2 mt-2">
                            <Button variant="ghost" onClick={() => setPreviewLine(null)} className="px-6 border border-grind-gray h-12 uppercase font-bold tracking-widest text-[#B3B3B3]">Back</Button>
                            <Button variant="primary" onClick={handleSave} className="px-6 h-12 uppercase font-black tracking-widest text-black bg-grind-accent hover:bg-grind-accent-hover shadow-[0_0_15px_rgba(200,255,0,0.2)]">Save Routine</Button>
                        </div>
                    </>
                )}
            </Card>
        </div>
    );
}