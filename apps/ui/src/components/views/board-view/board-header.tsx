import { HotkeyButton } from '@/components/ui/hotkey-button';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Bot, Wand2, Pencil, Globe } from 'lucide-react';
import { KeyboardShortcut } from '@/hooks/use-keyboard-shortcuts';
import { ClaudeUsagePopover } from '@/components/claude-usage-popover';
import { useAppStore } from '@/store/app-store';
import { useSetupStore } from '@/store/setup-store';
import type { BrowserToolMode } from '@automaker/types';

// Combined value for the browser mode dropdown
type BrowserModeValue = 'off' | BrowserToolMode;

interface BoardHeaderProps {
  projectName: string;
  maxConcurrency: number;
  runningAgentsCount: number;
  onConcurrencyChange: (value: number) => void;
  isAutoModeRunning: boolean;
  onAutoModeToggle: (enabled: boolean) => void;
  useBrowserMode: boolean;
  browserToolMode: BrowserToolMode;
  onBrowserModeChange: (useBrowserMode: boolean, browserToolMode: BrowserToolMode) => void;
  onAddFeature: () => void;
  onOpenPlanDialog: () => void;
  onOpenModifyDialog: () => void;
  addFeatureShortcut: KeyboardShortcut;
  isMounted: boolean;
}

// Shared styles for header control containers
const controlContainerClass =
  'flex items-center gap-1.5 px-3 h-8 rounded-md bg-secondary border border-border';

export function BoardHeader({
  projectName,
  maxConcurrency,
  runningAgentsCount,
  onConcurrencyChange,
  isAutoModeRunning,
  onAutoModeToggle,
  useBrowserMode,
  browserToolMode,
  onBrowserModeChange,
  onAddFeature,
  onOpenPlanDialog,
  onOpenModifyDialog,
  addFeatureShortcut,
  isMounted,
}: BoardHeaderProps) {
  // Compute the combined value for the dropdown
  const browserModeValue: BrowserModeValue = useBrowserMode ? browserToolMode : 'off';

  // Handle dropdown change
  const handleBrowserModeChange = (value: BrowserModeValue) => {
    if (value === 'off') {
      onBrowserModeChange(false, browserToolMode);
    } else {
      onBrowserModeChange(true, value as BrowserToolMode);
    }
  };
  const apiKeys = useAppStore((state) => state.apiKeys);
  const claudeAuthStatus = useSetupStore((state) => state.claudeAuthStatus);

  // Hide usage tracking when using API key (only show for Claude Code CLI users)
  // Check both user-entered API key and environment variable ANTHROPIC_API_KEY
  // Also hide on Windows for now (CLI usage command not supported)
  // Only show if CLI has been verified/authenticated
  const isWindows =
    typeof navigator !== 'undefined' && navigator.platform?.toLowerCase().includes('win');
  const hasApiKey = !!apiKeys.anthropic || !!claudeAuthStatus?.hasEnvApiKey;
  const isCliVerified =
    claudeAuthStatus?.authenticated && claudeAuthStatus?.method === 'cli_authenticated';
  const showUsageTracking = !hasApiKey && !isWindows && isCliVerified;

  return (
    <div className="flex items-center justify-between p-4 border-b border-border bg-glass backdrop-blur-md">
      <div>
        <h1 className="text-xl font-bold">Kanban Board</h1>
        <p className="text-sm text-muted-foreground">{projectName}</p>
      </div>
      <div className="flex gap-2 items-center">
        {/* Usage Popover - only show for CLI users (not API key users) */}
        {isMounted && showUsageTracking && <ClaudeUsagePopover />}

        {/* Concurrency Slider - only show after mount to prevent hydration issues */}
        {isMounted && (
          <div className={controlContainerClass} data-testid="concurrency-slider-container">
            <Bot className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Agents</span>
            <Slider
              value={[maxConcurrency]}
              onValueChange={(value) => onConcurrencyChange(value[0])}
              min={1}
              max={10}
              step={1}
              className="w-20"
              data-testid="concurrency-slider"
            />
            <span
              className="text-sm text-muted-foreground min-w-[5ch] text-center"
              data-testid="concurrency-value"
            >
              {runningAgentsCount} / {maxConcurrency}
            </span>
          </div>
        )}

        {/* Auto Mode Toggle - only show after mount to prevent hydration issues */}
        {isMounted && (
          <div className={controlContainerClass} data-testid="auto-mode-toggle-container">
            <Label htmlFor="auto-mode-toggle" className="text-sm font-medium cursor-pointer">
              Auto Mode
            </Label>
            <Switch
              id="auto-mode-toggle"
              checked={isAutoModeRunning}
              onCheckedChange={onAutoModeToggle}
              data-testid="auto-mode-toggle"
            />
          </div>
        )}

        {/* Browser Mode Dropdown - only show after mount to prevent hydration issues */}
        {isMounted && (
          <div className={controlContainerClass} data-testid="browser-mode-container">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <Select value={browserModeValue} onValueChange={handleBrowserModeChange}>
              <SelectTrigger
                className="w-[130px] h-6 border-0 bg-transparent focus:ring-0 focus:ring-offset-0"
                data-testid="browser-mode-select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="off">Off</SelectItem>
                <SelectItem value="agent-browser">agent-browser</SelectItem>
                <SelectItem value="chrome-extension">Chrome MCP</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <Button
          size="sm"
          variant="outline"
          onClick={onOpenPlanDialog}
          data-testid="plan-backlog-button"
        >
          <Wand2 className="w-4 h-4 mr-2" />
          Plan
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={onOpenModifyDialog}
          data-testid="modify-backlog-button"
        >
          <Pencil className="w-4 h-4 mr-2" />
          Modify
        </Button>

        <HotkeyButton
          size="sm"
          onClick={onAddFeature}
          hotkey={addFeatureShortcut}
          hotkeyActive={false}
          data-testid="add-feature-button"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Feature
        </HotkeyButton>
      </div>
    </div>
  );
}
