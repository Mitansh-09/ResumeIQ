import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'

// ─── Analyses ───────────────────────────────────────────────────────────────

export const saveAnalysis = async (userId, data) => {
  const ref = await addDoc(collection(db, 'analyses'), {
    userId,
    ...data,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export const getUserAnalyses = async (userId) => {
  const q = query(
    collection(db, 'analyses'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const getAnalysis = async (id) => {
  const snap = await getDoc(doc(db, 'analyses', id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export const deleteAnalysis = async (id) => {
  await deleteDoc(doc(db, 'analyses', id))
}

// ─── Roadmap ─────────────────────────────────────────────────────────────────

export const saveRoadmap = async (userId, analysisId, items) => {
  const ref = collection(db, 'roadmaps')
  const existing = query(ref, where('userId', '==', userId), where('analysisId', '==', analysisId))
  const snap = await getDocs(existing)

  if (!snap.empty) {
    await updateDoc(doc(db, 'roadmaps', snap.docs[0].id), { items, updatedAt: serverTimestamp() })
    return snap.docs[0].id
  }

  const newRef = await addDoc(ref, {
    userId,
    analysisId,
    items,
    createdAt: serverTimestamp(),
  })
  return newRef.id
}

export const getUserRoadmap = async (userId) => {
  const q = query(
    collection(db, 'roadmaps'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const updateRoadmapItem = async (roadmapId, items) => {
  await updateDoc(doc(db, 'roadmaps', roadmapId), { items, updatedAt: serverTimestamp() })
}

// ─── Prep Sessions ────────────────────────────────────────────────────────────

export const savePrepSession = async (userId, data) => {
  const ref = await addDoc(collection(db, 'prepSessions'), {
    userId,
    ...data,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export const getUserPrepSessions = async (userId) => {
  const q = query(
    collection(db, 'prepSessions'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const updatePrepAnswer = async (sessionId, answers) => {
  await updateDoc(doc(db, 'prepSessions', sessionId), { answers, updatedAt: serverTimestamp() })
}

// ─── User Profile ─────────────────────────────────────────────────────────────

export const saveUserProfile = async (userId, data) => {
  const ref = doc(db, 'users', userId)
  await setDoc(ref, { ...data, userId, updatedAt: serverTimestamp() }, { merge: true })
}

export const getUserProfile = async (userId) => {
  const snap = await getDoc(doc(db, 'users', userId))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}
