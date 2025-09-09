import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface EducationStore {
  isBeginnerMode: boolean
  hasSeenTour: boolean
  expandedIndicators: Set<string>
  
  toggleBeginnerMode: () => void
  setHasSeenTour: (seen: boolean) => void
  toggleIndicatorExpanded: (id: string) => void
  resetEducation: () => void
}

export const useEducationStore = create<EducationStore>()(
  persist(
    (set) => ({
      isBeginnerMode: false, // Default to advanced mode
      hasSeenTour: false,
      expandedIndicators: new Set<string>(),
      
      toggleBeginnerMode: () => set((state) => ({ 
        isBeginnerMode: !state.isBeginnerMode 
      })),
      
      setHasSeenTour: (seen) => set({ hasSeenTour: seen }),
      
      toggleIndicatorExpanded: (id) => set((state) => {
        const newExpanded = new Set(state.expandedIndicators)
        if (newExpanded.has(id)) {
          newExpanded.delete(id)
        } else {
          newExpanded.add(id)
        }
        return { expandedIndicators: newExpanded }
      }),
      
      resetEducation: () => set({
        isBeginnerMode: false,
        hasSeenTour: false,
        expandedIndicators: new Set()
      })
    }),
    {
      name: 'education-settings',
      partialize: (state) => ({
        isBeginnerMode: state.isBeginnerMode,
        hasSeenTour: state.hasSeenTour,
        // Don't persist expanded indicators
      })
    }
  )
)