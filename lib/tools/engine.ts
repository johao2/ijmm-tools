import type { FAQItem, Tool } from "@/lib/tools/types";

export type ToolDefinition = Tool;

export interface ToolExample {
  title: string;
  input: string;
  output: string;
  explanation?: string;
}

export interface ToolPageContent {
  introduction?: string;
  formula?: string;
  examples?: readonly ToolExample[];
  faqs?: readonly FAQItem[];
}

export interface ToolExecutionSuccess<TOutput> {
  success: true;
  output: TOutput;
}

export interface ToolExecutionFailure {
  success: false;
  code: string;
  message: string;
}

export type ToolExecutionResult<TOutput> =
  | ToolExecutionSuccess<TOutput>
  | ToolExecutionFailure;

export interface ToolModule<TInput, TOutput> {
  definition: ToolDefinition;
  content?: ToolPageContent;
  execute(input: TInput): ToolExecutionResult<TOutput>;
}

export interface ToolPage<TInput, TOutput> {
  module: ToolModule<TInput, TOutput>;
  relatedTools: readonly ToolDefinition[];
}

export function executeTool<TInput, TOutput>(
  module: ToolModule<TInput, TOutput>,
  input: TInput
): ToolExecutionResult<TOutput> {
  return module.execute(input);
}
