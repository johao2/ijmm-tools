import { describe, expect, it } from "vitest";
import { executeTool, type ToolModule } from "@/lib/tools/engine";

interface ExampleInput {
  value: number;
}

interface ExampleOutput {
  doubled: number;
}

const exampleModule: ToolModule<ExampleInput, ExampleOutput> = {
  definition: {
    id: "test-tool",
    slug: "test-tool",
    name: "Test Tool",
    shortDescription: "Test module",
    description: "A framework-independent test module.",
    categoryId: "calculators",
    icon: "Calculator",
    status: "planned",
    seo: {
      title: "Test Tool",
      description: "Test tool metadata.",
    },
  },
  execute(input) {
    if (!Number.isFinite(input.value)) {
      return {
        success: false,
        code: "INVALID_INPUT",
        message: "Value must be finite.",
      };
    }

    return {
      success: true,
      output: { doubled: input.value * 2 },
    };
  },
};

describe("Tool Engine", () => {
  it("executes a tool module without knowing its domain logic", () => {
    expect(executeTool(exampleModule, { value: 21 })).toEqual({
      success: true,
      output: { doubled: 42 },
    });
  });

  it("preserves typed module failures", () => {
    expect(executeTool(exampleModule, { value: Number.NaN })).toEqual({
      success: false,
      code: "INVALID_INPUT",
      message: "Value must be finite.",
    });
  });
});
