import { db } from './firebase'
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore'

// Collection name centralized for consistency
const COLLECTION = 'study_items'

/**
 * Save a new study item to Firestore
 */
export async function saveStudyItemToFirestore(text: string, email: string) {
  await addDoc(collection(db, 'study_items'), {
    text,
    email,
    date: Timestamp.now(),
  })
}
/**
 * Get study items added today
 */
export async function getTodayStudyItems(email: string) {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)

  const q = query(
    collection(db, 'study_items'),
    where('email', '==', email),
    where('date', '>=', Timestamp.fromDate(todayStart)),
    where('date', '<=', Timestamp.fromDate(todayEnd))
  )

  const snapshot = await getDocs(q)

 return snapshot.docs.map(doc => ({
    id: doc.id,
    text: doc.data().text,
    date: doc.data().date.toDate(),
  }))
}
/**
 * Update a study item's text
 */
export async function updateStudyItemInFirestore(id: string, newText: string): Promise<void> {
  const ref = doc(db, COLLECTION, id)
  await updateDoc(ref, { text: newText })
}

/**
 * Delete a study item
 */
export async function deleteStudyItemFromFirestore(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id))
}

/**
 * Get all study items for revision purposes
 */
export async function getRevisionItems(email: string): Promise<{ id: string; text: string; date: Date }[]> {
  const q = query(collection(db, COLLECTION), where('email', '==', email))
  const snapshot = await getDocs(q)

  return snapshot.docs.map(doc => ({
    id: doc.id,
    text: doc.data().text,
    date: doc.data().date.toDate()
  }))
}
