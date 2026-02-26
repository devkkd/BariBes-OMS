// Script to generate bcrypt password hashes
// Usage: node scripts/hash-password.js <password>

const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
  console.error('Please provide a password as argument');
  console.log('Usage: node scripts/hash-password.js <password>');
  process.exit(1);
}

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err);
    process.exit(1);
  }
  console.log('\nPassword:', password);
  console.log('Hashed:', hash);
  console.log('\nCopy this hash to use in your user database\n');
});
