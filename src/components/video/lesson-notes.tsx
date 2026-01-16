'use client'

import { useState, useEffect } from 'react'
import { Bookmark, Clock, Trash2, Plus, Send, X } from 'lucide-react'
import { createNote, deleteNote, getLessonNotes } from '@/app/actions/note-actions'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

interface Note {
    id: string
    content: string
    timestamp_seconds: number | null
}

export function LessonNotes({
    userId,
    courseId,
    lessonId,
    currentTimestamp,
    onJumpToTime
}: {
    userId: string
    courseId: string
    lessonId: string
    currentTimestamp: number
    onJumpToTime?: (seconds: number) => void
}) {
    const [notes, setNotes] = useState<Note[]>([])
    const [newNote, setNewNote] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const data = await getLessonNotes(userId, lessonId)
                setNotes(data as any)
            } catch (error) {
                console.error('Failed to load notes')
            }
        }
        fetchNotes()
    }, [userId, lessonId])

    const handleAddNote = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newNote.trim()) return

        setIsSaving(true)
        try {
            const timestamp = Math.floor(currentTimestamp)
            const res = await createNote({
                userId,
                courseId,
                lessonId,
                content: newNote,
                timestampSeconds: timestamp
            })

            if (res.success) {
                setNotes([...notes, res.note as any].sort((a, b) => (a.timestamp_seconds || 0) - (b.timestamp_seconds || 0)))
                setNewNote('')
                toast.success('Note added at ' + formatTime(timestamp))
            }
        } catch (error) {
            toast.error('Failed to save note')
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeleteNote = async (id: string) => {
        try {
            const res = await deleteNote(id)
            if (res.success) {
                setNotes(notes.filter(n => n.id !== id))
            }
        } catch (error) {
            toast.error('Failed to delete note')
        }
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <div className="bg-card rounded-2xl border border-white/10 overflow-hidden shadow-xl flex flex-col h-full">
            <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
                <h3 className="font-bold flex items-center gap-2">
                    <Bookmark className="w-4 h-4 text-primary" />
                    Lesson Notes
                </h3>
                <span className="text-xs text-muted-foreground font-medium">{notes.length} saved</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[400px]">
                <AnimatePresence>
                    {notes.map((note) => (
                        <motion.div
                            key={note.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="bg-white/5 p-3 rounded-xl group transition-all hover:bg-white/10"
                        >
                            <div className="flex items-center justify-between mb-1">
                                <button
                                    onClick={() => note.timestamp_seconds !== null && onJumpToTime?.(note.timestamp_seconds)}
                                    className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full flex items-center gap-1 hover:bg-primary/20 transition-colors"
                                >
                                    <Clock className="w-3 h-3" />
                                    {note.timestamp_seconds !== null ? formatTime(note.timestamp_seconds) : 'General'}
                                </button>
                                <button onClick={() => handleDeleteNote(note.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-all">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <p className="text-xs text-foreground leading-relaxed">{note.content}</p>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {notes.length === 0 && (
                    <div className="py-10 text-center text-muted-foreground">
                        <Bookmark className="w-8 h-8 opacity-20 mx-auto mb-2" />
                        <p className="text-xs">Take a note while watching!</p>
                    </div>
                )}
            </div>

            <form onSubmit={handleAddNote} className="p-4 border-t border-white/10 bg-white/5">
                <div className="relative">
                    <textarea
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 pr-10 text-xs focus:border-primary outline-none transition-all min-h-[60px] resize-none"
                        placeholder={`Take a note at ${formatTime(currentTimestamp)}...`}
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                    />
                    <button
                        type="submit"
                        disabled={isSaving || !newNote.trim()}
                        className="absolute bottom-3 right-3 p-1.5 bg-primary rounded-lg text-white disabled:opacity-50 hover:scale-105 transition-transform"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </form>
        </div>
    )
}
