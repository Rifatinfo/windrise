"use client";
import  { useEffect, useRef } from 'react'

type LoopingShortProps = {
  src: string
  title: string
  className?: string
}

export function LoopingShort({ src, title, className = '' }: LoopingShortProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const play = () => {
      const attempt = video.play()
      if (attempt && typeof attempt.catch === 'function') attempt.catch(() => undefined)
    }

    // Keep it running no matter what the browser or tab visibility does.
    const handleEnded = () => {
      video.currentTime = 0
      play()
    }

    play()
    video.addEventListener('ended', handleEnded)
    video.addEventListener('pause', play)
    document.addEventListener('visibilitychange', play)

    return () => {
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('pause', play)
      document.removeEventListener('visibilitychange', play)
    }
  }, [src])

  return (
    <div className={`relative overflow-hidden bg-white ${className}`}>
      <video
        ref={videoRef}
        src={src}
        aria-label={title}
        className="h-full w-full object-contain"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        controls={false}
      />
      {/* Nothing is clickable, so no native control overlay can appear. */}
      <div className="absolute inset-0" aria-hidden="true" />
    </div>
  )
}
