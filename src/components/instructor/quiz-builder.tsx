'use client'

import { useState } from 'react'
import { Plus, Trash2, CheckCircle2, AlertCircle, HelpCircle, Save, X } from 'lucide-react'
import { addQuestion, updateQuestion, deleteQuestion } from '@/app/actions/quiz-actions'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

interface Question {
    id: string
    question_text: string
    question_type: 'multiple_choice' | 'true_false' | 'short_answer'
    options: string[]
    correct_answer: string
    explanation: string
    points: number
}

export function QuizBuilder({ quizId, initialQuestions = [] }: { quizId: string, initialQuestions?: Question[] }) {
    const [questions, setQuestions] = useState<Question[]>(initialQuestions)
    const [isSaving, setIsSaving] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)

    const handleAddQuestion = async () => {
        const newQuestion: any = {
            question_text: 'New Question',
            question_type: 'multiple_choice' as const,
            options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
            correct_answer: 'Option 1',
            explanation: '',
            points: 1,
            order_index: questions.length + 1
        }

        try {
            const res = await addQuestion(quizId, newQuestion)
            if (res.success) {
                setQuestions([...questions, res.question as any])
                setEditingId(res.question.id)
                toast.success('Question added')
            }
        } catch (error) {
            toast.error('Failed to add question')
        }
    }

    const handleUpdateQuestion = async (id: string, updates: Partial<Question>) => {
        try {
            const res = await updateQuestion(id, updates)
            if (res.success) {
                setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q))
                toast.success('Saved')
            }
        } catch (error) {
            toast.error('Failed to save')
        }
    }

    const handleDeleteQuestion = async (id: string) => {
        if (!confirm('Are you sure you want to delete this question?')) return
        try {
            const res = await deleteQuestion(id)
            if (res.success) {
                setQuestions(questions.filter(q => q.id !== id))
                toast.success('Question deleted')
            }
        } catch (error) {
            toast.error('Failed to delete question')
        }
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between bg-card p-6 rounded-2xl border border-white/10 shadow-xl">
                <div>
                    <h2 className="text-xl font-bold">Quiz Questions</h2>
                    <p className="text-sm text-muted-foreground">{questions.length} questions total</p>
                </div>
                <button
                    onClick={handleAddQuestion}
                    className="btn-primary px-4 py-2 rounded-xl flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add Question
                </button>
            </div>

            <div className="space-y-4">
                {questions.map((q, index) => (
                    <motion.div
                        key={q.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card border border-white/10 rounded-2xl overflow-hidden shadow-lg"
                    >
                        {editingId === q.id ? (
                            <div className="p-6 space-y-4">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-xs font-bold uppercase tracking-widest text-primary">Question {index + 1}</span>
                                    <button onClick={() => setEditingId(null)} className="text-muted-foreground hover:text-white">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium block mb-2">Question Text</label>
                                        <textarea
                                            className="input-field min-h-[100px]"
                                            value={q.question_text}
                                            onChange={(e) => setQuestions(questions.map(item => item.id === q.id ? { ...item, question_text: e.target.value } : item))}
                                            onBlur={(e) => handleUpdateQuestion(q.id, { question_text: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium block mb-2">Points</label>
                                            <input
                                                type="number"
                                                className="input-field"
                                                value={q.points}
                                                onChange={(e) => setQuestions(questions.map(item => item.id === q.id ? { ...item, points: parseInt(e.target.value) } : item))}
                                                onBlur={(e) => handleUpdateQuestion(q.id, { points: parseInt(e.target.value) })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium block mb-2">Type</label>
                                            <select
                                                className="input-field"
                                                value={q.question_type}
                                                onChange={(e) => handleUpdateQuestion(q.id, { question_type: e.target.value as any })}
                                            >
                                                <option value="multiple_choice">Multiple Choice</option>
                                                <option value="true_false">True / False</option>
                                                <option value="short_answer">Short Answer</option>
                                            </select>
                                        </div>
                                    </div>

                                    {q.question_type === 'multiple_choice' && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium block mb-2">Options</label>
                                            {q.options?.map((opt, i) => (
                                                <div key={i} className="flex gap-2">
                                                    <input
                                                        type="radio"
                                                        name={`correct-${q.id}`}
                                                        checked={q.correct_answer === opt}
                                                        onChange={() => handleUpdateQuestion(q.id, { correct_answer: opt })}
                                                        className="mt-3"
                                                    />
                                                    <input
                                                        type="text"
                                                        className="input-field"
                                                        value={opt}
                                                        onChange={(e) => {
                                                            const newOpts = [...q.options]
                                                            newOpts[i] = e.target.value
                                                            setQuestions(questions.map(item => item.id === q.id ? { ...item, options: newOpts } : item))
                                                        }}
                                                        onBlur={() => handleUpdateQuestion(q.id, { options: q.options })}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div>
                                        <label className="text-sm font-medium block mb-2">Explanation</label>
                                        <textarea
                                            className="input-field"
                                            placeholder="Why is this the correct answer?"
                                            value={q.explanation}
                                            onChange={(e) => setQuestions(questions.map(item => item.id === q.id ? { ...item, explanation: e.target.value } : item))}
                                            onBlur={(e) => handleUpdateQuestion(q.id, { explanation: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 flex items-start gap-4 group cursor-pointer hover:bg-white/5 transition-colors" onClick={() => setEditingId(q.id)}>
                                <div className="p-2 bg-primary/10 rounded-lg text-primary font-bold">{index + 1}</div>
                                <div className="flex-1">
                                    <p className="font-semibold text-lg mb-2">{q.question_text}</p>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
                                        <span className="uppercase">{q.question_type.replace('_', ' ')}</span>
                                        <span>•</span>
                                        <span>{q.points} Points</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleDeleteQuestion(q.id)
                                        }}
                                        className="p-2 hover:bg-red-500/10 rounded-lg text-red-500"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            {questions.length === 0 && (
                <div className="text-center py-20 bg-card border border-dashed border-white/10 rounded-3xl">
                    <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">No questions yet</h3>
                    <p className="text-muted-foreground mb-6">Create your first quiz question to get started.</p>
                    <button onClick={handleAddQuestion} className="btn-secondary px-6 py-2.5 rounded-xl font-bold">
                        Add First Question
                    </button>
                </div>
            )}
        </div>
    )
}
