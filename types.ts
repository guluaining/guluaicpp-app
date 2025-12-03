
export type Language = 'en' | 'cn';

export interface LocalizedText {
  en: string;
  cn: string;
}

export type ProblemId = 'ASSIGNMENT' | 'SWAP' | 'FIND_MAX' | 'SORT_3';

export interface VariableState {
  name: string;
  value: number;
  color: string;
  address: string;
}

export interface ProblemPreset {
  label: LocalizedText;
  values: Record<string, number>;
}

// --- ESL TYPES ---
export type ESLWordType = 'common' | 'specific';

export interface ESLWord {
  en: string;
  cn: string;
  type: ESLWordType;
}

export interface ESLQuestion {
  type: 'match_cn' | 'match_en' | 'fill_code';
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface ESLData {
  words: ESLWord[];
  questions: ESLQuestion[];
}

// --- VISUALIZATION MODES TYPES ---

export interface PseudocodeStep {
  text: LocalizedText;
  indent: number; // 0 for main, 1 for inside if/loop
  stepTrigger: number[]; // Which steps highlight this line
}

export type FlowchartNodeType = 'start' | 'process' | 'decision' | 'end';

export interface FlowchartNode {
  id: string;
  type: FlowchartNodeType;
  label: LocalizedText;
  x: number;
  y: number;
  stepTrigger: number[]; // Which steps make this node active
}

export interface FlowchartEdge {
  from: string;
  to: string;
  label?: LocalizedText; // Yes/No for decisions
}

export interface FlowchartData {
  nodes: FlowchartNode[];
  edges: FlowchartEdge[];
}

// --- PROBLEM DEF ---
export interface ProblemDef {
  id: ProblemId;
  title: LocalizedText;
  description: LocalizedText;
  summary: LocalizedText;
  keyTakeaways: LocalizedText[];
  code: string;
  fullCode: string;
  initialValues: Record<string, number>;
  maxSteps: number;
  presets: ProblemPreset[];
  esl: ESLData;
  pseudocode: PseudocodeStep[]; // NEW
  flowchart: FlowchartData;    // NEW
}

export interface TokenExplanation {
  title: LocalizedText;
  desc: LocalizedText;
}

export interface StepMapping {
  [key: number]: number;
}
