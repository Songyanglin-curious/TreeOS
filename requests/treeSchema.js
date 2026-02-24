const VALID_TYPES = new Set(["project", "module", "feature"]);

function assertNode(node, path = "root") {
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

  if (typeof node.title !== "string" || !node.title.trim()) {
    throw new Error(`Invalid title at ${path}`);
  }

  if (!VALID_TYPES.has(node.type)) {
    throw new Error(`Invalid type at ${path}: ${node.type}`);
  }

  if (!Array.isArray(node.children)) {
    throw new Error(`Invalid children at ${path}: expected array`);
  }

  if (typeof node.notes !== "string") {
    throw new Error(`Invalid notes at ${path}: expected string`);
  }

  node.children.forEach((child, index) => {
    assertNode(child, `${path}.children[${index}]`);
  });
}

export function validateTreeSchema(tree) {
  assertNode(tree);
  return true;
}
