import {
  collection,
  doc,
  getDocs,
  setDoc,
} from 'firebase/firestore';
import { firestore } from '../lib/firebase';
import type { QuickValue, FinancialYear } from '../types';

let isSeeding = false;

export async function seedInitialData(): Promise<void> {
  if (isSeeding) return;
  isSeeding = true;

  try {
    // 1. Seed Financial Years if empty
    const fySnap = await getDocs(collection(firestore, 'financialYears'));
    if (fySnap.empty) {
      const fYears: FinancialYear[] = [
        { id: '2026-2027', name: '2026-2027', isCurrent: true },
        { id: '2025-2026', name: '2025-2026', isCurrent: false },
        { id: '2024-2025', name: '2024-2025', isCurrent: false },
      ];
      for (const fy of fYears) {
        await setDoc(doc(firestore, 'financialYears', fy.id), fy);
      }
    }

    // 2. Seed Quick Values if empty
    const qvSnap = await getDocs(collection(firestore, 'quickValues'));
    if (qvSnap.empty) {
      const quickValues: Array<Omit<QuickValue, 'id'>> = [
        { category: 'paymentTerms', value: '15' },
        { category: 'paymentTerms', value: '7' },
        { category: 'paymentTerms', value: '30' },
        { category: 'paymentTerms', value: 'NEXT DAY' },
        { category: 'paymentTerms', value: 'ADVANCE' },
        { category: 'quality', value: 'A-1' },
        { category: 'quality', value: '1 GADI' },
        { category: 'quality', value: '50 BORI 40 Kg' },
        { category: 'quality', value: '30-40 M.TON' },
        { category: 'rdValue', value: 'A-1' },
        { category: 'rdValue', value: '75' },
        { category: 'rdValue', value: '76' },
        { category: 'rdValue', value: '78' },
      ];
      let qId = 1;
      for (const qv of quickValues) {
        await setDoc(doc(firestore, 'quickValues', String(qId)), {
          ...qv,
          id: qId,
        });
        qId++;
      }
      await setDoc(doc(firestore, 'counters', 'quickValues'), {
        value: quickValues.length,
        updatedAt: new Date().toISOString(),
      });
    }

    // Notice: NO demo companies, NO demo parties, NO demo items, NO demo sauda orders are seeded.
    // The user starts completely fresh and enters their own real data!
  } catch (err) {
    console.warn('Initial data check in Firestore:', err);
  } finally {
    isSeeding = false;
  }
}

export async function resetDatabaseToDemo(): Promise<void> {
  // Empty
}
