import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

/**
 * Hash a password using bcrypt
 * @param plainPassword The plain text password to hash
 * @returns Promise that resolves to the hashed password
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  try {
    return await bcrypt.hash(plainPassword, SALT_ROUNDS);
  } catch (err) {
    throw new Error('Failed to hash password');
  }
}

/**
 * Verify a password against a stored hash
 * @param plainPassword The plain text password to verify
 * @param hashedPassword The stored hashed password
 * @returns Promise that resolves to true if passwords match
 */
export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (err) {
    console.error('Password verification error:', err);
    return false;
  }
}
