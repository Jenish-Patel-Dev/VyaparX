import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  runTransaction,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { firestore } from '../lib/firebase';

/**
 * Atomically increments and returns the next integer sequence ID for a given collection/counter.
 */
export async function getNextSequenceId(counterKey: string): Promise<number> {
  const counterRef = doc(firestore, 'counters', counterKey);
  try {
    return await runTransaction(firestore, async (transaction) => {
      const snap = await transaction.get(counterRef);
      let currentVal = 0;
      if (snap.exists()) {
        currentVal = snap.data().value || 0;
      }
      const nextVal = currentVal + 1;
      transaction.set(counterRef, { value: nextVal, updatedAt: new Date().toISOString() }, { merge: true });
      return nextVal;
    });
  } catch (err) {
    console.warn(`Firestore transaction for counter '${counterKey}' failed, falling back to manual max ID:`, err);
    // Fallback: query collection docs to find max id
    const colRef = collection(firestore, counterKey);
    const snap = await getDocs(colRef);
    let maxId = 0;
    snap.forEach((d) => {
      const id = Number(d.id) || Number(d.data().id) || 0;
      if (id > maxId) maxId = id;
    });
    const nextVal = maxId + 1;
    await setDoc(counterRef, { value: nextVal, updatedAt: new Date().toISOString() }, { merge: true }).catch(() => {});
    return nextVal;
  }
}

/**
 * Converts a Firestore document snapshot into a typed object with its ID.
 */
export function docToData<T>(snap: QueryDocumentSnapshot<DocumentData>): T {
  const data = snap.data();
  const idNum = Number(snap.id);
  return {
    ...data,
    id: isNaN(idNum) ? snap.id : idNum,
  } as T;
}
