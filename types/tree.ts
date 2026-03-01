export type TreeType = "project" | "module" | "feature";

export interface TreeNode {
  title: string;
  type: TreeType;
  children: TreeNode[];
  notes: string;
}

export interface AnalyzeResult {
  draft: string;
  json: TreeNode;
  retried?: boolean;
  firstError?: string;
}
