import { useMemo } from 'react';
import { sampleData } from '@/engine/sampleData';
import { computeAll } from '@/engine/calculations';
import type { WealthMapComputed } from '@/engine/types';

export function useWealthData(): WealthMapComputed {
  return useMemo(() => computeAll(sampleData), []);
}
