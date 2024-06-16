# Essays

Kind of like Goodreads, but for scholarly essays/articles that are not available as books. A personal web app I made for me and my friend so we can organize the stuff we read  :  )

## Features

1. User Authentication: Users can sign in and sign out using Google oAuth.
2. Essay Management: Add, edit, view, and delete essays (and upload files!) to create a personal library.
3. Firebase Integration: Essays are stored and retrieved from a Firebase Firestore database.
3. Dynamic UI: Using Next UI and Framer Motion, for a smooth and responsive user experience.

## Technologies Used

1. Next.js: Framework for React applications.
2. Firebase: For authentication and Firestore database.
3. CSS Modules: For styling components.
4. NextAuth.js: For handling authentication.
5. Next UI and Framer Motion: For creating dynamic UI components.


## Getting Started

### Prerequisites
1. Node.js (v14 or later)
2. Firebase account with a Firestore database
3. Firebase storage for storing essay cover images
4. Create an .env file in the root directory with the following variables:

```
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
NEXTAUTH_SECRET
NEXTAUTH_URL
```

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.
