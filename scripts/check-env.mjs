/**
 * Build time environment check.
 *
 * This runs before prisma and next, so a misconfigured variable fails the
 * build in a couple of seconds with a message that says how to fix it,
 * instead of failing later with a tool specific error.
 */

const problems = [];

const databaseUrl = process.env.DATABASE_URL;
const jwtSecret = process.env.JWT_SECRET;

if (!databaseUrl) {
  problems.push(
    "DATABASE_URL is missing. Copy .env.example to .env, or set it in your hosting provider."
  );
} else if (!/^postgres(ql)?:\/\//.test(databaseUrl)) {
  // The usual cause: pasting the whole psql command that Neon and other
  // providers show, or pasting the URL wrapped in quotes.
  const looksLikePsqlCommand = /^\s*psql\b/i.test(databaseUrl);
  const looksQuoted = /^['"]/.test(databaseUrl);

  let hint =
    "It must start with postgresql:// or postgres://. Paste only the connection URL.";

  if (looksLikePsqlCommand) {
    hint =
      "It starts with 'psql'. You pasted the whole psql command. Paste only the URL inside the quotes.";
  } else if (looksQuoted) {
    hint = "It starts with a quote. Paste the URL without surrounding quotes.";
  }

  problems.push(`DATABASE_URL is not a valid PostgreSQL URL. ${hint}`);
}

if (!jwtSecret) {
  problems.push(
    "JWT_SECRET is missing. Generate one with: openssl rand -base64 32"
  );
} else if (jwtSecret.length < 32) {
  problems.push(
    `JWT_SECRET is only ${jwtSecret.length} characters. Use at least 32. Generate one with: openssl rand -base64 32`
  );
}

if (problems.length > 0) {
  console.error("\nEnvironment check failed:\n");
  for (const problem of problems) {
    console.error(`  - ${problem}`);
  }
  console.error("");
  process.exit(1);
}

console.log("Environment check passed.");
