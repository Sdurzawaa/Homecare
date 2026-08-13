export function resolveSchemaName(schemaName) {
  const value = typeof schemaName === "string" ? schemaName.trim() : "";
  return value || "public";
}

export function buildSearchPath(schemaName) {
  const resolved = resolveSchemaName(schemaName);

  if (resolved === "public") {
    return "public";
  }

  const needsQuote = (s) => !/^[a-z_][a-z0-9_]*$/.test(String(s));
  const quote = (s) => `"${String(s).replace(/"/g, '""')}"`;
  return `${needsQuote(resolved) ? quote(resolved) : resolved},public`;
}

export function quoteIdent(name) {
  return `"${String(name).replace(/"/g, '""')}"`;
}

export function withSchema(tableName, schemaName) {
  if (!tableName || typeof tableName !== "string") {
    return tableName;
  }

  const trimmed = tableName.trim();
  if (!trimmed) return trimmed;
  if (trimmed.includes(".")) return trimmed;

  const resolved = resolveSchemaName(schemaName);
  const needsQuote = (s) => !/^[a-z_][a-z0-9_]*$/.test(String(s));
  const quote = (s) => `"${String(s).replace(/"/g, '""')}"`;
  const left = needsQuote(resolved) ? quote(resolved) : resolved;
  const right = needsQuote(trimmed) ? quote(trimmed) : trimmed;
  return `${left}.${right}`;
}

export function normalizeApiKey(headers = {}) {
  const header = Object.entries(headers).find(
    ([key]) => key.toLowerCase() === "x-api-key",
  );

  return header ? header[1] : undefined;
}
