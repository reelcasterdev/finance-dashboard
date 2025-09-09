'use client'

import { GraduationCap, Zap } from 'lucide-react'
import { useEducationStore } from '@/lib/stores/education-store'
import { cn } from '@/lib/utils'

export function ModeToggle() {
  const { isBeginnerMode, toggleBeginnerMode } = useEducationStore()
  
  return (
    <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full p-1 shadow-sm border border-gray-200">
      <button
        onClick={toggleBeginnerMode}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
          isBeginnerMode 
            ? "bg-blue-100 text-blue-700"
            : "text-gray-500 hover:text-gray-700"
        )}
        disabled={isBeginnerMode}
      >
        <GraduationCap className="w-4 h-4" />
        Beginner
      </button>
      
      <button
        onClick={toggleBeginnerMode}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
          !isBeginnerMode
            ? "bg-purple-100 text-purple-700"
            : "text-gray-500 hover:text-gray-700"
        )}
        disabled={!isBeginnerMode}
      >
        <Zap className="w-4 h-4" />
        Advanced
      </button>
    </div>
  )
}