import type { TreeNode, TreeType } from "../types/tree.js";

const VALID_TYPES = new Set<TreeType>(["project", "module", "feature"]);

function assertNode(node: unknown, path = "root"): asserts node is TreeNode {
  if (!node || typeof node !== "object" || Array.isArray(node)) {
    throw new Error(`Invalid node at ${path}: expected object`);
  }

  const keys = Object.keys(node);
  const allowed = ["title", "type", "children", "notes"];
  for (const key of keys) {
    if (!allowed.includes(key)) {
      throw new Error(`Invalid field "${key}" at ${path}`);
    }
  }

  const candidate = node as Record<string, unknown>;

  if (typeof candidate.title !== "string" || !candidate.title.trim()) {
    throw new Error(`Invalid title at ${path}`);
  }

  if (typeof candidate.type !== "string" || !VALID_TYPES.has(candidate.type as TreeType)) {
    throw new Error(`Invalid type at ${path}: ${String(candidate.type)}`);
  }

  if (!Array.isArray(candidate.children)) {
    throw new Error(`Invalid children at ${path}: expected array`);
  }

  if (typeof candidate.notes !== "string") {
    throw new Error(`Invalid notes at ${path}: expected string`);
  }

  candidate.children.forEach((child, index) => {
    assertNode(child, `${path}.children[${index}]`);
  });
}

export function validateTreeSchema(tree: unknown): tree is TreeNode {
  assertNode(tree);
  return true;
}
