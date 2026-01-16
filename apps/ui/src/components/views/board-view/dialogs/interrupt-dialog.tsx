import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { HotkeyButton } from '@/components/ui/hotkey-button';
import {
  DescriptionImageDropZone,
  FeatureImagePath as DescriptionImagePath,
  ImagePreviewMap,
} from '@/components/ui/description-image-dropzone';
import { PlayCircle, StopCircle, Loader2 } from 'lucide-react';
import { Feature } from '@/store/app-store';

interface InterruptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: Feature | null;
  recentOutput?: string;
  isInterrupting?: boolean;
  onContinue: (message: string, imagePaths?: string[]) => void;
  onStop: () => void;
  isMaximized: boolean;
}

export function InterruptDialog({
  open,
  onOpenChange,
  feature,
  recentOutput,
  isInterrupting = false,
  onContinue,
  onStop,
  isMaximized,
}: InterruptDialogProps) {
  const [message, setMessage] = useState('');
  const [imagePaths, setImagePaths] = useState<DescriptionImagePath[]>([]);
  const [previewMap, setPreviewMap] = useState<ImagePreviewMap>(new Map());

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setMessage('');
      setImagePaths([]);
      setPreviewMap(new Map());
    }
  }, [open]);

  const handleClose = (open: boolean) => {
    if (!open) {
      onOpenChange(false);
    }
  };

  const handleContinue = () => {
    if (message.trim()) {
      const paths = imagePaths.map((img) => img.path);
      onContinue(message.trim(), paths.length > 0 ? paths : undefined);
      onOpenChange(false);
    }
  };

  const handleStop = () => {
    onStop();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        compact={!isMaximized}
        data-testid="interrupt-dialog"
        onKeyDown={(e: React.KeyboardEvent) => {
          if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && message.trim()) {
            e.preventDefault();
            handleContinue();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>
            {isInterrupting ? 'Interrupting Feature...' : 'Feature Interrupted'}
          </DialogTitle>
          <DialogDescription>
            {isInterrupting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Pausing the agent execution...
              </span>
            ) : (
              <>
                The agent has been paused. Provide guidance or instructions to continue, or stop the
                feature entirely.
                {feature && (
                  <span className="block mt-2 text-primary">
                    Feature: {feature.description.slice(0, 100)}
                    {feature.description.length > 100 ? '...' : ''}
                  </span>
                )}
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {!isInterrupting && (
          <>
            {recentOutput && (
              <div className="space-y-2">
                <Label>Recent Agent Output</Label>
                <div className="bg-muted p-3 rounded-md text-xs font-mono max-h-32 overflow-y-auto whitespace-pre-wrap">
                  {recentOutput}
                </div>
              </div>
            )}

            <div className="space-y-4 py-4 overflow-y-auto flex-1 min-h-0">
              <div className="space-y-2">
                <Label htmlFor="interrupt-message">Your Input</Label>
                <DescriptionImageDropZone
                  value={message}
                  onChange={setMessage}
                  images={imagePaths}
                  onImagesChange={setImagePaths}
                  placeholder="Provide guidance, corrections, or additional context..."
                  previewMap={previewMap}
                  onPreviewMapChange={setPreviewMap}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                The agent will resume execution with your input. You can attach screenshots to help
                explain the issue.
              </p>
            </div>
          </>
        )}

        <DialogFooter>
          {isInterrupting ? (
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          ) : (
            <>
              <Button variant="destructive" onClick={handleStop} data-testid="interrupt-stop">
                <StopCircle className="w-4 h-4 mr-2" />
                Stop Feature
              </Button>
              <HotkeyButton
                onClick={handleContinue}
                disabled={!message.trim()}
                hotkey={{ key: 'Enter', cmdCtrl: true }}
                hotkeyActive={open}
                data-testid="interrupt-continue"
              >
                <PlayCircle className="w-4 h-4 mr-2" />
                Continue with Input
              </HotkeyButton>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
