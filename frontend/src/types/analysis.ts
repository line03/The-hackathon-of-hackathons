export interface QuizAnalysisResponse {
    per_question: Array<{
        question_index: number;
        question: string;
        correct_answer?: string;
        explanation: string;
        filename: string;
        diagram_code?: string | null;
    }>;
    overall_summary: string;
}


