export interface ReflectionFeedback {
    strengths: string[];
    missing_points: string[];
    improved_sentence: string;
}

export interface ReflectionAnalysis {
    actors: string[];
    action: string;
    benefit_receiver: string;
    type_of_corruption: string[];
    harm: string[];
    rule_or_duty_breached: string;
    score: number;
    feedback: ReflectionFeedback;
}

export interface ReflectionRequest {
    module_number: number;
    student_response: string;
}

