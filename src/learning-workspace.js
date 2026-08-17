import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'scholartube-learning-workspace-v1'

const EMPTY_WORKSPACE = {
  saved: [],
  queue: [],
  progress: {},
  notes: {},
  transcripts: {},
  goal: { focus: 'World Model', language: 'All', minutes: 45, level: 'Starting out' },
}

function readWorkspace() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY_WORKSPACE
    const parsed = JSON.parse(raw)
    return { ...EMPTY_WORKSPACE, ...parsed, progress: parsed.progress || {}, notes: parsed.notes || {}, transcripts: parsed.transcripts || {} }
  } catch {
    return EMPTY_WORKSPACE
  }
}

function toggleId(values, id) {
  return values.includes(id) ? values.filter((value) => value !== id) : [...values, id]
}

export function useLearningWorkspace() {
  const [workspace, setWorkspace] = useState(readWorkspace)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace))
  }, [workspace])

  const toggleSaved = useCallback((id) => setWorkspace((current) => ({ ...current, saved: toggleId(current.saved, id) })), [])
  const toggleQueue = useCallback((id) => setWorkspace((current) => ({ ...current, queue: toggleId(current.queue, id) })), [])
  const setProgress = useCallback((id, value) => setWorkspace((current) => ({
    ...current,
    progress: { ...current.progress, [id]: value },
  })), [])
  const saveNote = useCallback((id, note) => setWorkspace((current) => ({
    ...current,
    notes: { ...current.notes, [id]: [...(current.notes[id] || []), { ...note, id: `${Date.now()}-${Math.random().toString(36).slice(2)}` }] },
  })), [])
  const removeNote = useCallback((resourceId, noteId) => setWorkspace((current) => ({
    ...current,
    notes: { ...current.notes, [resourceId]: (current.notes[resourceId] || []).filter((note) => note.id !== noteId) },
  })), [])
  const setTranscript = useCallback((id, text) => setWorkspace((current) => ({
    ...current,
    transcripts: { ...current.transcripts, [id]: text },
  })), [])
  const setGoal = useCallback((goal) => setWorkspace((current) => ({ ...current, goal: { ...current.goal, ...goal } })), [])

  return { workspace, actions: { toggleSaved, toggleQueue, setProgress, saveNote, removeNote, setTranscript, setGoal } }
}

