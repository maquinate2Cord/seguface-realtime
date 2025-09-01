import '../styles/globals.css';
import React from 'react';

export const metadata = {
  title: 'Seguface • Realtime Scoring',
  description: 'Dashboard de scoring en tiempo real',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <div className="fixed inset-0 bg-gradient-to-b from-sky-900/30 via-slate-900 to-black -z-10" />
        <div className="fixed inset-0 bg-grid -z-10" />
        {children}
      </body>
    </html>
  );
}