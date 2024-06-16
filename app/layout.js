// import components
import AuthProvider from "./AuthProvider";

// import styling
import "./globals.css";

export const metadata = {
  title: "Home",
  description: "",
};

export default function RootLayout({ children }) {
  return (
    <AuthProvider>
      <html lang="en">
        <body>
          <div>{children}</div>
        </body>
      </html>
    </AuthProvider>
  );
}
