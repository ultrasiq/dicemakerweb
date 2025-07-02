'use client';

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { BabylonDiceManager } from '@/lib/babylon-utils';
import { DiceType } from '@/types/dice';

interface DiceViewerProps {
  diceType: DiceType;
}

export interface DiceViewerRef {
  getDiceManager: () => BabylonDiceManager | null;
}

const DiceViewer = forwardRef<DiceViewerRef, DiceViewerProps>(
  ({ diceType }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const diceManagerRef = useRef<BabylonDiceManager | null>(null);

    useImperativeHandle(ref, () => ({
      getDiceManager: () => diceManagerRef.current,
    }));

    useEffect(() => {
      if (!canvasRef.current) return;

      // Initialize Babylon.js
      diceManagerRef.current = new BabylonDiceManager(canvasRef.current);
      diceManagerRef.current.createDice(diceType);

      // Start rendering loop
      const renderLoop = () => {
        if (diceManagerRef.current) {
          diceManagerRef.current.render();
        }
        requestAnimationFrame(renderLoop);
      };
      renderLoop();

      // Handle window resize
      const handleResize = () => {
        if (diceManagerRef.current) {
          diceManagerRef.current.resize();
        }
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (diceManagerRef.current) {
          diceManagerRef.current.dispose();
        }
      };
    }, [diceType]);

    return (
      <div className="relative w-full aspect-square bg-transparent">
        <canvas
          ref={canvasRef}
          className="w-full h-full rounded-lg"
          style={{ touchAction: 'none' }}
        />
      </div>
    );
  }
);

DiceViewer.displayName = 'DiceViewer';

export default DiceViewer; 