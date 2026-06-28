# Admin Web Panel

This folder contains a self-contained Firebase admin web panel for product, category, storage, and order management.

## Files

- `index.html` - Admin dashboard UI.
- `styles.css` - Dashboard styling.
- `app.js` - Firebase initialization and admin panel logic.

## Setup

1. Deploy this folder as a static site (Firebase Hosting, Vercel, Netlify, or any web server).
2. Make sure the Firebase project configuration in `app.js` matches your Firebase project.
3. Use the admin login form to sign in with an existing Firebase Auth admin user.

## Admin Credentials

If you do not have an admin user yet, run `node create_admin_user.js` from the project root to create one.

Default credentials in the project are:

- Email: `admin@testt.com`
- Password: `Admin@12345`

If the email already exists, update the password or use a different email.

## Notes

- This panel uses Firebase Auth, Firestore, and Storage.
- Ensure your Firebase security rules allow authenticated admin access for Firestore and Storage.
- The admin panel only works when the user is signed in.
