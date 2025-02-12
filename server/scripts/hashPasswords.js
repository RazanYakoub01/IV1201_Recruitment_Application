const pool = require('../src/db'); // ✅ Ensure correct path
const bcrypt = require('bcrypt');

const hashExistingPasswords = async () => {
  const client = await pool.connect();
  try {
    console.log("🔄 Starting password hashing...");

    // Fetch all users with non-null passwords
    const users = await client.query('SELECT person_id, password FROM public.person WHERE password IS NOT NULL');

    for (const user of users.rows) {
      const { person_id, password } = user;

      // ✅ Skip already hashed passwords
      if (password && (password.startsWith("$2b$") || password.startsWith("$2a$"))) {
        console.log(`✅ Skipping user ${person_id}, already hashed.`);
        continue;
      }

      // ✅ Only hash valid (non-null) passwords
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await client.query('UPDATE public.person SET password = $1 WHERE person_id = $2', [hashedPassword, person_id]);
        console.log(`🔐 Updated password for user ${person_id}`);
      } else {
        console.log(`⚠️ Skipping user ${person_id} because password is NULL.`);
      }
    }

    console.log("✅ Password hashing completed.");
  } catch (err) {
    console.error("❌ Error hashing passwords:", err);
  } finally {
    client.release();
  }
};

// Run the script
hashExistingPasswords();
