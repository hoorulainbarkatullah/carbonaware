import { ObjectId } from "mongodb";

/**
 * Validates whether a string is a 24-character hexadecimal MongoDB ObjectId.
 */
export function isValidObjectId(id: string | null | undefined): boolean {
  if (!id || typeof id !== "string") return false;
  return ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Safely constructs a Prisma `where` filter for User lookup by ID or Email
 * without causing Prisma P2023 Malformed ObjectID crashes.
 */
export function buildUserWhereClause(userIdOrEmail: string | null | undefined) {
  if (!userIdOrEmail || typeof userIdOrEmail !== "string" || !userIdOrEmail.trim()) {
    return null;
  }

  const clean = userIdOrEmail.trim();

  if (isValidObjectId(clean)) {
    return {
      OR: [{ id: clean }, { email: clean.toLowerCase() }],
    };
  }

  // If not a valid ObjectId (e.g. an email address or non-hex string), search strictly by email
  return {
    email: clean.toLowerCase(),
  };
}
