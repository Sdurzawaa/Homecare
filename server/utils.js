export function resolveSchemaName(schemaName) {
  const value = typeof schemaName === "string" ? schemaName.trim() : "";
  return value || "public";
}

export function withSchema(tableName, schemaName) {
  if (!tableName || typeof tableName !== "string") {
    return tableName;
  }

  const trimmed = tableName.trim();
  if (!trimmed) return trimmed;
  if (trimmed.includes(".")) return trimmed;

  return `${resolveSchemaName(schemaName)}.${trimmed}`;
}

export function normalizeApiKey(headers = {}) {
  const header = Object.entries(headers).find(
    ([key]) => key.toLowerCase() === "x-api-key",
  );

  return header ? header[1] : undefined;
}
