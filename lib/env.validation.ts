/**
 * Validate required environment variables at startup
 * Fail early if configuration is missing
 */
export function validateEnvironmentVariables() {
  const requiredVars = ['DATABASE_URL', 'JWT_SECRET'];
  const missing: string[] = [];

  requiredVars.forEach((varName) => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
      `Copy .env.example to .env and fill in the required values.`
    );
  }

  if ((process.env.JWT_SECRET || '').length < 32) {
    throw new Error(
      'JWT_SECRET must be at least 32 characters long. ' +
      'Generate one with: openssl rand -base64 32'
    );
  }
}
