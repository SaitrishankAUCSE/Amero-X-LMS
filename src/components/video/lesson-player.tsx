'use client'

import React, { useEffect, useRef, useState } from 'react'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'
import { updateLessonProgress } from '@/app/actions/progress-actions'
import { Maximize, Play, Pause, Volume2, Settings, SkipForward, SkipBack, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface VideoPlayerProps {
    src: string
    poster?: string
    courseId: string
    lessonId: string
    userId: string
    initialProgress?: number
    onProgress?: (seconds: number) => void
    onReady?: (player: any) => void
    onComplete?: () => void
}

export const LessonVideoPlayer: React.FC<VideoPlayerProps> = ({
    src,
    poster,
    courseId,
    lessonId,
    userId,
    initialProgress = 0,
    onProgress,
    onReady,
    onComplete
}) => {
    const videoRef = useRef<HTMLDivElement>(null)
    const playerRef = useRef<any>(null)
    const [isReady, setIsReady] = useState(false)
    const [lastSaved, setLastSaved] = useState(0)

    useEffect(() => {
        if (!videoRef.current) return

        const videoElement = document.createElement('video-js')
        videoElement.classList.add('vjs-big-play-centered', 'vjs-premium-theme')
        videoRef.current.appendChild(videoElement)

        const player = videojs(videoElement, {
            autoplay: false,
            controls: true,
            responsive: true,
            fluid: true,
            poster,
            sources: [{ src, type: 'video/mp4' }], // Fallback for direct links
            controlBar: {
                children: [
                    'playToggle',
                    'volumePanel',
                    'currentTimeDisplay',
                    'timeDivider',
                    'durationDisplay',
                    'progressControl',
                    'playbackRateMenuButton',
                    'fullscreenToggle',
                ],
            },
        }, () => {
            setIsReady(true)
            if (onReady) onReady(player)
            if (typeof initialProgress === 'number' && initialProgress > 0) {
                player.currentTime(initialProgress)
            }
        })

        player.on('timeupdate', () => {
            if (onProgress) onProgress(player.currentTime())
        })

        playerRef.current = player

        // Auto-save progress every 10 seconds
        const saveInterval = setInterval(() => {
            if (player && !player.paused()) {
                const currentTime = player.currentTime()
                if (typeof currentTime === 'number' && Math.abs(currentTime - lastSaved) >= 10) {
                    saveProgress(Math.floor(currentTime))
                }
            }
        }, 10000)

        // Mark as completed when video ends
        player.on('ended', () => {
            const duration = player.duration()
            if (typeof duration === 'number' && !isNaN(duration)) {
                saveProgress(Math.floor(duration), 'completed')
            }
            if (onComplete) onComplete()
        })

        return () => {
            clearInterval(saveInterval)
            if (player) {
                player.dispose()
                playerRef.current = null
            }
        }
    }, [src])

    const saveProgress = async (seconds: number, status: 'in_progress' | 'completed' = 'in_progress') => {
        try {
            await updateLessonProgress({
                userId,
                courseId,
                lessonId,
                status,
                videoProgress: seconds
            })
            setLastSaved(seconds)
        } catch (error) {
            console.error('Failed to save progress:', error)
        }
    }

    return (
        <div className="relative group w-full aspect-video rounded-3xl overflow-hidden bg-black shadow-2xl border border-white/5">
            <div ref={videoRef} className="w-full h-full" />

            <AnimatePresence>
                {!isReady && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex items-center justify-center bg-black"
                    >
                        <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                .vjs-premium-theme {
                    background-color: transparent;
                }
                .vjs-premium-theme .vjs-control-bar {
                    background: rgba(15, 15, 15, 0.7) !important;
                    backdrop-filter: blur(12px);
                    border-radius: 20px;
                    bottom: 20px;
                    left: 20px;
                    right: 20px;
                    width: calc(100% - 40px);
                    height: 60px;
                    border: 1px border rgba(255, 255, 255, 0.1);
                    display: flex;
                    align-items: center;
                    padding: 0 10px;
                }
                .vjs-premium-theme .vjs-progress-control {
                    flex: 1;
                }
                .vjs-premium-theme .vjs-play-progress {
                    background-color: #6366f1 !important;
                }
                .vjs-premium-theme .vjs-slider {
                    background-color: rgba(255, 255, 255, 0.2);
                    border-radius: 10px;
                    height: 6px;
                }
                .vjs-premium-theme .vjs-load-progress {
                    background-color: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .vjs-premium-theme .vjs-big-play-button {
                    background-color: rgba(99, 102, 241, 0.9) !important;
                    border: none !important;
                    width: 80px !important;
                    height: 80px !important;
                    line-height: 80px !important;
                    border-radius: 50% !important;
                    backdrop-filter: blur(4px);
                    box-shadow: 0 0 40px rgba(99, 102, 241, 0.4);
                    transition: all 0.3s ease;
                }
                .vjs-premium-theme:hover .vjs-big-play-button {
                    transform: scale(1.1);
                    background-color: #6366f1 !important;
                }
            `}</style>
        </div>
    )
}
