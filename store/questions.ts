import { create } from "zustand";

export interface QuestionOptionPayload {
  question_id: string;
  field: string;
  label: string;
  options: string[];
}

export interface QuestionsPayload {
  method?: "question" | string;
  status?: "next" | string;
  question: QuestionOptionPayload;
  index: number;
  total: number;
}

interface QuestionsState {
  data: QuestionsPayload | null;
  setData: (data: QuestionsPayload | null) => void;
  clearData: () => void;
}

export const useQuestionsStore = create<QuestionsState>((set) => ({
  data: null,
  setData: (data) => set({ data }),
  clearData: () => set({ data: null }),
}));
