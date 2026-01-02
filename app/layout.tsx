// app/layout.tsx
import './globals.css';
import { AuthProvider } from './context/AuthProvider'; // ajuste o path conforme sua estrutura
import { ThemeProvider } from './providers/ThemeProvider'; // provider que criamos para toggle de tema

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body>
        <AuthProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
