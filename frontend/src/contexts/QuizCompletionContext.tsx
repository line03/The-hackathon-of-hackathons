import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

interface CompletionState {
    [key: string]: {
        easy?: boolean;
        medium?: boolean;
        hard?: boolean;
        completed?: boolean; // For Image Theatre main quiz and subfolders
    };
}

interface QuizCompletionContextType {
    markCompleted: (module: string, difficulty?: 'easy' | 'medium' | 'hard') => void;
    isCompleted: (module: string, difficulty?: 'easy' | 'medium' | 'hard') => boolean;
    getCompletionStatus: () => CompletionState;
    resetCompletionState: () => void;
}

const QuizCompletionContext = createContext<QuizCompletionContextType | undefined>(undefined);

export function QuizCompletionProvider({ children }: { children: ReactNode }) {
    const [completionState, setCompletionState] = useState<CompletionState>({});

    // Hydrate from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem('quizCompletionState');
            if (stored) {
                const parsed = JSON.parse(stored) as CompletionState;
                setCompletionState(parsed);
            }
        } catch (error) {
            console.error('Failed to load quiz completion state:', error);
        }
    }, []);

    const markCompleted = (module: string, difficulty?: 'easy' | 'medium' | 'hard') => {
        setCompletionState((prev) => {
            const newState = { ...prev };
            if (!newState[module]) {
                newState[module] = {};
            }
            if (difficulty) {
                newState[module][difficulty] = true;
            } else {
                newState[module].completed = true;
            }

            try {
                localStorage.setItem('quizCompletionState', JSON.stringify(newState));
            } catch (error) {
                console.error('Failed to save quiz completion state:', error);
            }

            return newState;
        });
    };

    const isCompleted = (module: string, difficulty?: 'easy' | 'medium' | 'hard'): boolean => {
        const moduleState = completionState[module];
        if (!moduleState) return false;
        
        if (difficulty) {
            return moduleState[difficulty] === true;
        }
        return moduleState.completed === true;
    };

    const getCompletionStatus = (): CompletionState => {
        return completionState;
    };

    const resetCompletionState = () => {
        setCompletionState({});
        try {
            localStorage.removeItem('quizCompletionState');
        } catch (error) {
            console.error('Failed to clear quiz completion state:', error);
        }
    };

    return (
        <QuizCompletionContext.Provider
            value={{
                markCompleted,
                isCompleted,
                getCompletionStatus,
                resetCompletionState,
            }}
        >
            {children}
        </QuizCompletionContext.Provider>
    );
}

export function useQuizCompletion() {
    const context = useContext(QuizCompletionContext);
    if (context === undefined) {
        throw new Error('useQuizCompletion must be used within a QuizCompletionProvider');
    }
    return context;
}

