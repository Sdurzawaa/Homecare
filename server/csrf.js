import crypto from "crypto";

export const createCsrfToken = () => crypto.randomBytes(32).toString("hex");

export const validateCsrfToken = (cookieValue, headerValue) => {
  const cookieToken = String(cookieValue || "");
  const headerToken = String(headerValue || "");

  if (!cookieToken || !headerToken || cookieToken.length !== headerToken.length) {
    return false;
  }

  try {
    return crypto.timingSafeEqual(
      Buffer.from(cookieToken, "utf8"),
      Buffer.from(headerToken, "utf8"),
    );
  } catch {
    return false;
  }
};
