export type ServerActionResult<T = unknown> = Promise<
  | {
      success: true;
      data?: T;
    }
  | {
      success: false;
      error: { form?: string; _errors?: string[] } & T;
    }
>;

export type PlateContent = Array<{
  type: string;
  children: Array<{ text: string }>;
  [key: string]: unknown;
}>;

export type DocumentContent = Record<string, unknown>[];

export type QuizQuestion = {
  id: string;
  text: string;
  options: string[] | string;
  correctAnswer: string;
  explanation?: string | null;
};

export type Quiz = {
  id: string;
  title: string;
  description?: string;
  topic: string;
  difficulty: string;
  questions: QuizQuestion[];
};
