// import components
import AuthProvider from "./AuthProvider";

// import styling
import "./globals.css";

export const metadata = {
  title: "shelf",
  description: ""
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
