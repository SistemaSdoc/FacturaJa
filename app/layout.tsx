// app/layout.tsx
import './globals.css';
import { AuthProvider } from './context/AuthProvider'; // path conforme onde criou

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
