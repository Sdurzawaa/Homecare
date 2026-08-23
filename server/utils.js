export function resolveSchemaName(schemaName) {
  const value = typeof schemaName === "string" ? schemaName.trim() : "";
  return value || "public";
}

const needsQuote = (value) => !/^[a-z_][a-z0-9_]*$/.test(String(value));
const quote = (value) => `"${String(value).replace(/"/g, '""')}"`;
const quoteIfNeeded = (value) =>
  needsQuote(value) ? quote(value) : String(value);

export function buildSearchPath(schemaName) {
  const resolved = resolveSchemaName(schemaName);

  if (resolved === "public") {
    return "public";
  }

  return `${quoteIfNeeded(resolved)},public`;
}

export function quoteIdent(name) {
  return quote(name);
}

export function withSchema(tableName, schemaName) {
  if (!tableName || typeof tableName !== "string") {
    return tableName;
  }

  const trimmed = tableName.trim();
  if (!trimmed) return trimmed;
  if (trimmed.includes(".")) return trimmed;

  const resolved = resolveSchemaName(schemaName);
  const left = quoteIfNeeded(resolved);
  const right = quoteIfNeeded(trimmed);
  return `${left}.${right}`;
}

export function normalizeApiKey(headers = {}) {
  const header = Object.entries(headers).find(
    ([key]) => key.toLowerCase() === "x-api-key",
  );

  return header ? header[1] : undefined;
}

export function normalizeAdminUsername(username) {
  if (typeof username !== "string") return "";
  return username.trim().toLowerCase();
}

export function isValidAdminUsername(username) {
  return (
    typeof username === "string" &&
    username.trim() !== "" &&
    /^[A-Za-z0-9_-]+$/.test(username.trim())
  );
}

export function isValidAdminPassword(password) {
  return (
    typeof password === "string" &&
    password.length >= 12 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password)
  );
}
