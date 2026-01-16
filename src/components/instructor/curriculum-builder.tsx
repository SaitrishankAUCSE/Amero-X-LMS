'use client'

import { useState, useMemo } from 'react'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragOverEvent,
    DragStartEvent,
    defaultDropAnimationSideEffects,
    DropAnimation,
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Pencil, Plus, Trash2, Video, FileText, CheckCircle2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { reorderSections, reorderLessonsAcrossSections, createSection, deleteSection } from '@/app/actions/instructor-actions'
import toast from 'react-hot-toast'

interface Lesson {
    id: string
    section_id: string
    title: string
    content_type: string
    order_index: number
}

interface Section {
    id: string
    title: string
    order_index: number
    lessons: Lesson[]
}

// --- Sortable Lesson Component ---
function SortableLesson({ lesson, sectionId }: { lesson: Lesson; sectionId: string }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: lesson.id,
        data: {
            type: 'lesson',
            sectionId
        }
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-xl mb-2 group hover:border-primary/30 transition-all shadow-sm"
        >
            <div {...attributes} {...listeners} className="cursor-grab text-muted-foreground hover:text-primary">
                <GripVertical className="h-4 w-4" />
            </div>

            <div className="p-1.5 bg-primary/5 rounded-lg">
                {lesson.content_type === 'video' ? <Video className="w-3.5 h-3.5 text-primary" /> : <FileText className="w-3.5 h-3.5 text-primary" />}
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{lesson.title}</p>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-muted-foreground hover:text-foreground">
                    <Pencil className="h-3.5 w-3.5" />
                </button>
                <button className="p-1.5 hover:bg-red-500/10 rounded-lg text-muted-foreground hover:text-red-500">
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    )
}

// --- Sortable Section Component ---
function SortableSection({ section, children }: { section: Section; children: React.ReactNode }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: section.id,
        data: {
            type: 'section'
        }
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    return (
        <div ref={setNodeRef} style={style} className="mb-6">
            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-2xl mb-4 group cursor-default">
                <div {...attributes} {...listeners} className="cursor-grab text-muted-foreground hover:text-primary">
                    <GripVertical className="h-5 w-5" />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold flex items-center gap-2">
                        {section.title}
                        <span className="text-xs font-medium text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                            {section.lessons.length} lessons
                        </span>
                    </h3>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-lg transition-all">
                        <Plus className="w-3.5 h-3.5" />
                        Add Lesson
                    </button>
                    <button className="p-2 hover:bg-red-500/10 rounded-lg text-muted-foreground hover:text-red-500 transition-colors">
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="pl-10 space-y-2 border-l-2 border-dashed border-gray-200 dark:border-gray-800 ml-6 min-h-[50px]">
                {children}
            </div>
        </div>
    )
}

// --- Main Builder Component ---
export function EnhancedCurriculumBuilder({
    courseId,
    initialSections = []
}: {
    courseId: string;
    initialSections: Section[]
}) {
    const [sections, setSections] = useState<Section[]>(initialSections)
    const [activeId, setActiveId] = useState<string | null>(null)
    const [isSaving, setIsSaving] = useState(false)

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    const findSectionId = (id: string) => {
        if (sections.find(s => s.id === id)) return id
        const section = sections.find(s => s.lessons.find(l => l.id === id))
        return section?.id
    }

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string)
    }

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event
        if (!over) return

        const activeId = active.id as string
        const overId = over.id as string

        const activeSectionId = findSectionId(activeId)
        const overSectionId = findSectionId(overId)

        if (!activeSectionId || !overSectionId || activeSectionId === overSectionId) return

        setSections(prev => {
            const activeSection = prev.find(s => s.id === activeSectionId)
            const overSection = prev.find(s => s.id === overSectionId)
            if (!activeSection || !overSection) return prev

            const activeIndex = activeSection.lessons.findIndex(l => l.id === activeId)
            if (activeIndex === -1) return prev // It might be a section move, not a lesson move

            const newActiveLessons = [...activeSection.lessons]
            const [movedLesson] = newActiveLessons.splice(activeIndex, 1)
            movedLesson.section_id = overSectionId

            const newOverLessons = [...overSection.lessons]
            // Calculate where to insert the lesson in the new section
            const overIndex = overSection.lessons.findIndex(l => l.id === overId)
            const insertIndex = overIndex >= 0 ? overIndex : newOverLessons.length
            newOverLessons.splice(insertIndex, 0, movedLesson)

            return prev.map(s => {
                if (s.id === activeSectionId) return { ...s, lessons: newActiveLessons }
                if (s.id === overSectionId) return { ...s, lessons: newOverLessons }
                return s
            })
        })
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event
        setActiveId(null)

        if (!over) return

        if (active.id !== over.id) {
            const activeData = active.data.current
            const overData = over.data.current

            if (activeData?.type === 'section') {
                // Section reordering
                setSections(items => {
                    const oldIndex = items.findIndex(s => s.id === active.id)
                    const newIndex = items.findIndex(s => s.id === over.id)
                    const newItems = arrayMove(items, oldIndex, newIndex)

                    const updates = newItems.map((s, i) => ({ id: s.id, order_index: i + 1 }))
                    saveSections(updates)
                    return newItems
                })
            } else {
                // Lesson reordering within section
                const sectionId = findSectionId(active.id as string)
                if (!sectionId) return

                setSections(prev => {
                    const section = prev.find(s => s.id === sectionId)
                    if (!section) return prev

                    const oldIndex = section.lessons.findIndex(l => l.id === active.id)
                    const newIndex = section.lessons.findIndex(l => l.id === over.id)
                    const newLessons = arrayMove(section.lessons, oldIndex, newIndex)

                    // Finalize the section/order for all lessons in the course across sections
                    const allUpdates: any[] = []
                    const updatedSections = prev.map(s => {
                        const lessons = s.id === sectionId ? newLessons : s.lessons
                        lessons.forEach((l, i) => {
                            allUpdates.push({ id: l.id, section_id: s.id, order_index: i + 1 })
                        })
                        return { ...s, lessons }
                    })

                    saveLessons(allUpdates)
                    return updatedSections
                })
            }
        }
    }

    const saveSections = async (updates: any) => {
        setIsSaving(true)
        try {
            await reorderSections(courseId, updates)
            toast.success('Section order saved')
        } catch (error) {
            toast.error('Failed to save section order')
        } finally {
            setIsSaving(false)
        }
    }

    const saveLessons = async (updates: any) => {
        setIsSaving(true)
        try {
            await reorderLessonsAcrossSections(courseId, updates)
            toast.success('Curriculum updated')
        } catch (error) {
            toast.error('Failed to save curriculum')
        } finally {
            setIsSaving(false)
        }
    }

    const handleAddSection = async () => {
        const title = prompt('Enter section title:')
        if (!title) return

        try {
            const res = await createSection(courseId, title, sections.length + 1)
            if (res.success) {
                setSections([...sections, { ...res.section, lessons: [] }])
                toast.success('Section created')
            }
        } catch (error) {
            toast.error('Failed to create section')
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold">Course Curriculum</h2>
                    <p className="text-sm text-muted-foreground">Manage your course sections and lessons</p>
                </div>
                <button
                    onClick={handleAddSection}
                    className="btn-primary px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20"
                >
                    <Plus className="w-5 h-5" />
                    New Section
                </button>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                    <div className={isSaving ? 'opacity-50 pointer-events-none' : ''}>
                        {sections.map(section => (
                            <SortableSection key={section.id} section={section}>
                                <SortableContext items={section.lessons.map(l => l.id)} strategy={verticalListSortingStrategy}>
                                    {section.lessons.map(lesson => (
                                        <SortableLesson key={lesson.id} lesson={lesson} sectionId={section.id} />
                                    ))}
                                    {section.lessons.length === 0 && (
                                        <div className="py-8 text-center bg-gray-50/50 dark:bg-white/5 rounded-xl border border-dashed border-gray-200 dark:border-white/5">
                                            <p className="text-xs text-muted-foreground font-medium">No lessons in this section</p>
                                        </div>
                                    )}
                                </SortableContext>
                            </SortableSection>
                        ))}
                    </div>
                </SortableContext>

                {sections.length === 0 && (
                    <div className="py-20 text-center bg-gray-50 dark:bg-white/5 rounded-3xl border-2 border-dashed border-gray-200 dark:border-white/10">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Plus className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">No sections yet</h3>
                        <p className="text-muted-foreground max-w-xs mx-auto mb-6">Start building your course structure by adding your first section.</p>
                        <button onClick={handleAddSection} className="btn-secondary px-6 py-2.5 rounded-xl font-bold">
                            Create First Section
                        </button>
                    </div>
                )}
            </DndContext>

            {isSaving && (
                <div className="fixed bottom-8 right-8 bg-card border border-white/10 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    <span className="text-sm font-bold">Saving changes...</span>
                </div>
            )}
        </div>
    )
}
