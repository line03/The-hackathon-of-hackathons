export interface AnswerOption {
    text: string;
    isCorrect: boolean;
    rationale: string;
}

export interface Question {
    question: string;
    answerOptions: AnswerOption[];
    hint: string;
}

export interface QuizModule {
    name: string;
    quiz: Question[];
}

export interface QuizData {
    modules: QuizModule[];
}

