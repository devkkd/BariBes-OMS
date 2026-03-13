# Fix Email Index Issue

## Problem
Users cannot be created without email because of duplicate key error on null email values.

## Solution
Run the following command to drop the old unique email index:

```bash
cd my-app
node scripts/fix-email-index.js
```

## What this does
- Connects to your MongoDB database
- Drops the `email_1` unique index from the `users` collection
- Allows multiple users to have no email or same email

## After running the script
You will be able to:
- Create users without providing an email
- Create multiple users with the same password
- Create users with duplicate emails (if needed)

## Note
The User model has been updated to remove the unique constraint on email field.
