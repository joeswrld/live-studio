import { ArrowRightLeft, Circle, Radio, Scissors } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ProductionControlsProps {
  canCut: boolean;
  canSwap: boolean;
  busy?: boolean;
  onCut: () => void;
  onSwap: () => void;
}

/**
 * Switcher controls. CUT and SWAP operate on real, persisted session state.
 * Record and Go Live are rendered disabled because their back ends are not
 * built yet; they are labelled as such rather than pretending to work.
 */
export function ProductionControls({ canCut, canSwap, busy, onCut, onSwap }: ProductionControlsProps) {
  return (
    <div className="panel flex flex-wrap items-center gap-2 p-3">
      <Button variant="primary" onClick={onCut} disabled={!canCut} loading={busy} title="Send the preview camera to program">
        <Scissors className="h-4 w-4" /> Cut to program
      </Button>
      <Button onClick={onSwap} disabled={!canSwap || busy} title="Swap preview and program">
        <ArrowRightLeft className="h-4 w-4" /> Swap
      </Button>

      <div className="mx-1 hidden h-6 w-px bg-studio-600 sm:block" />

      <Button disabled title="Recording is not implemented yet (planned for a later phase)">
        <Circle className="h-4 w-4 text-live" /> Record
        <span className="rounded bg-studio-900 px-1.5 py-0.5 text-[10px] uppercase text-slate-400">Not yet available</span>
      </Button>
      <Button disabled title="Live streaming is not implemented yet (planned for a later phase)">
        <Radio className="h-4 w-4" /> Go live
        <span className="rounded bg-studio-900 px-1.5 py-0.5 text-[10px] uppercase text-slate-400">Not yet available</span>
      </Button>
    </div>
  );
}
