'use client'

import { useState } from 'react'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Pencil } from 'lucide-react'
import { reorderLessons } from '@/app/actions/admin-courses'
import toast from 'react-hot-toast'

// Sortable Item Component
function SortableLesson({ lesson }: { lesson: any }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: lesson.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg mb-2"
        >
            <div
                {...attributes}
                {...listeners}
                className="cursor-grab hover:text-indigo-600 dark:text-gray-400"
            >
                <GripVertical className="h-5 w-5" />
            </div>
            <div className="flex-1 font-medium text-gray-900 dark:text-gray-100">
                {lesson.title}
                <span className="ml-2 text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full uppercase">
                    {lesson.type || 'video'}
                </span>
                {lesson.is_free && (
                    <span className="ml-2 text-xs text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                        Free
                    </span>
                )}
            </div>
            <div className="flex items-center gap-2">
                <a
                    href={`/admin/courses/${lesson.course_id}/lessons/${lesson.id}/edit`}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-blue-600"
                >
                    <Pencil className="h-4 w-4" />
                </a>
            </div>
        </div>
    )
}

interface CurriculumBuilderProps {
    initialLessons: any[]
}

export function CurriculumBuilder({ initialLessons = [] }: CurriculumBuilderProps) {
    const [lessons, setLessons] = useState(initialLessons)
    const [isSaving, setIsSaving] = useState(false)

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event

        if (over && active.id !== over.id) {
            setLessons((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id)
                const newIndex = items.findIndex((item) => item.id === over.id)
                const newItems = arrayMove(items, oldIndex, newIndex)

                // Prepare updates based on new index order
                const updates = newItems.map((lesson, index) => ({
                    id: lesson.id,
                    order_index: index + 1
                }))

                // Save to server
                setIsSaving(true)
                reorderLessons(updates)
                    .then(() => toast.success('Lesson order saved'))
                    .catch(() => {
                        toast.error('Failed to save order')
                        setLessons(items) // Revert on failure
                    })
                    .finally(() => setIsSaving(false))

                return newItems
            })
        }
    }

    if (lessons.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
                <p className="text-gray-500">No lessons added yet. Use the form above to get started!</p>
            </div>
        )
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <div className={isSaving ? 'opacity-50 pointer-events-none' : ''}>
                <SortableContext
                    items={lessons}
                    strategy={verticalListSortingStrategy}
                >
                    <div>
                        {lessons.map((lesson) => (
                            <SortableLesson key={lesson.id} lesson={lesson} />
                        ))}
                    </div>
                </SortableContext>
            </div>
        </DndContext>
    )
}
