<img src="./public/banner.png" style="width: auto; height: 400px; position: relative; left: 50%; transform: translate(-50%, 0);">

# [Shelf](https://readwithmanaland.zzzzion.com)

Kind of like Goodreads, but for essays/articles from the web that are not
available as books. A personal app I made for me and my friend so we can
organize the stuff we read : )

Ask the AI assistant for reading recommendations, or to explain a difficult
passage from a text. The PDF generation feature is the star of the show: paste a
link to a paywalled article, and the app will generate an unlocked PDF of the
full article and save it to your shelf. (It works for non-paywalled articles
too, of course!)

Pasting the link also autofills relevant metadata (title and author), which
allows for quick shelving. For this feature, I initially set up my own CORS
proxy server with Node.js for handling autofill on the form for adding essays. I
later realized I could just set up an API route for that the client side
component can hit, and the Next.js server would make a request to the target
website, which avoidss the CORS issue altogether.

I also spent a lot of time building custom UI components, such as modals,
checkboxes, and dropdowns. Although robust and functional, I ended up not using
the in the final version of the app, as I found better alternatives in the Next
UI library. Only the loader is still in use — I think it fits the look of the
overall app. I kept the custom components in the codebase for future reference,
even if they are not being used in the app.

<div style="display: flex; justify-content: center; max-width: 100%; overflow-x: auto;">
  <img src="./public/mobile.png" style="width: auto; height: 400px; margin-right: 10px;">
  <img src="./public/extra.png" style="width: auto; height: 400px;">
</div>

## Features

1. Essay Management: Add, edit, view, and delete essays (and upload files!) to
   create a personal library. These essays can be sorted by title, author, or
   date added. All the data is stored on Firebase.
2. **AI Reading Assistant: Type '/ai' in the search bar to get started!**
3. **PDF Generation: Generate PDFs of paywalled articles by pasting the link. To
   achieve this, I set up an Express server on Render.com, and it uses the
   Puppeteer library to navigate the web and generate PDFs. When the user
   requests a PDF, an API request is made, and the server generates the PDF and
   sends it back to the client. The PDF is then saved to Firebase storage and
   displayed on the essay page.**
4. **iOS Shortcut: User generates an API key for their account and pastes it in
   the iOS shortcut. They can then add articles to their shelf with just one
   tap! Instructions and shortcut download link can be seen by tapping the
   profile icon.**
5. Autofill feature: Autofill the add essay form with website metadata, fetched
   from an API route, also implemented with Next.js. When the user pastes a
   valid link, it makes a request to the backend, which fetches the relevant
   metadata from the website's Open Graph tags and sends it back to the client.
6. User Authentication: Users can sign up using their Google Account. This uses
   NextAuth.js, and the user can stay logged in even after the session ends, and
   I don't have to worry about handling JWT tokens.
7. Dynamic UI: Using Next UI, Framer Motion, and custom UI components for a
   smooth and responsive user experience.
8. Design details: Responsive and looks great on all devices, from desktop to
   mobile. Loading screens and small animations are added for a better user
   experience.

## Technologies Used

1. Next.js: Framework for React applications.
2. Firebase: For authentication and Firestore database.
3. Node.js: For setting up an Express server for the PDF generation feature.
4. Puppeteer: For generating PDFs of paywalled articles.
5. Framer Motion: For adding animations.
6. NextAuth.js: For handling authentication.
7. Next UI and Framer Motion: For creating dynamic UI components.