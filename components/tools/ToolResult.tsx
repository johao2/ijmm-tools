import React from "react";
import ToolOutput, { type ToolOutputProps } from "./ToolOutput";

export interface ToolResultProps extends ToolOutputProps {}

export function ToolResult(props: ToolResultProps) {
  return <ToolOutput {...props} />;
}

export default ToolResult;
