export function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/u).length : 0;
}

export const writingChecklists = {
  task1: [
    { id: "paraphrase", text: "Kirishda savolni o‘z so‘zlarim bilan qayta yozdim." },
    { id: "overview", text: "Umumiy xulosada raqamsiz ikki asosiy xususiyatni aytdim." },
    { id: "grouping", text: "Asosiy ma’lumotlarni guruhlab taqqosladim." },
    { id: "data-check", text: "Raqam, birlik va fe’l zamonini tekshirdim." },
    { id: "word-count", text: "Javob kamida 150 so‘z." },
  ],
  task2: [
    { id: "all-parts", text: "Savolning barcha qismlariga javob berdim." },
    { id: "position", text: "Kirish va xulosadagi pozitsiyam bir xil." },
    { id: "body-structure", text: "Har bir asosiy paragrafda g‘oya, izoh va misol bor." },
    { id: "flow", text: "Fikrlar mexanik bog‘lovchilarsiz ravon ulangan." },
    { id: "word-count", text: "Javob kamida 250 so‘z." },
    { id: "proofread", text: "Oxirgi 3 daqiqada artikl, zamon, moslashuv va vergulni tekshirdim." },
  ],
} as const;
