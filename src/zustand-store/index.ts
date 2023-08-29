import { create } from "zustand"
import { api } from "../lib/axios"

interface Course {
    id: number
    modules: Array<{
        id: number
        title: string
        lessons: Array<{
            id: string
            title: string
            duration: string
        }>
    }>
}

export interface PlayerState {
    course: Course | null;
    currentModuleIndex: number;
    currentLessonIndex: number;
    isLoading: boolean;

    play: (moduleAndLessonIndex: [number, number]) => void
    next: () => void
    load: () => Promise<void>
}

export const useStore = create<PlayerState>((set, get) => {

    return {// oque tem dentro do playerstate
        course: null,
        currentModuleIndex: 0,
        currentLessonIndex: 0,
        isLoading: false,

        load: async () => {
            set({ isLoading: true })

            const response = await api.get('/courses/1')

            set({
                course: response.data,
                isLoading: false
            })
        },

        play: (moduleAndLessonIndex: [number, number]) => {//destrutura
            const [moduleIndex, lessonIndex] = moduleAndLessonIndex

            set({
                currentModuleIndex: moduleIndex,
                currentLessonIndex: lessonIndex
            })
        },

        next: () => {
            const { course, currentLessonIndex, currentModuleIndex } = get()//só pegar oque vc quiser , n precisa desestrutura igual no set
            const nextLessonIndex = currentLessonIndex + 1 // coloca o prox video
            const nextLesson = course?.modules[currentModuleIndex].lessons[nextLessonIndex];

            if (nextLesson) {
                set({ currentLessonIndex: nextLessonIndex }) // se tiver prox video coloca mais 1

            } else {//se nao tiver prox aula, vou ver se tem prox modulo e dar player na prox aula
                const nextModuleIndex = currentModuleIndex + 1 // prox modulo
                const nextModule = course?.modules[nextModuleIndex];

                if (nextModule) {//se existir o prox modulo
                    set({
                        currentModuleIndex: nextModuleIndex, // colocar o prox modulo
                        currentLessonIndex: 0// coloca a primeira aula
                    })
                }
            }
        }
    }
})
export const useCurrentLesson = () => {
    return useStore(state => {
        const { currentModuleIndex, currentLessonIndex } = state

        const currentModule = state.course?.modules[currentModuleIndex]
        const currentLesson = currentModule?.lessons[currentLessonIndex]

        return { currentModule, currentLesson }
    })
}