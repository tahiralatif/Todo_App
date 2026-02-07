import '../styles/globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { AccessibilityProvider } from '@/components/ui/AccessibilityProvider';
import { NotificationProvider } from '@/components/ui/Notifications';
import { WebSocketProvider } from '@/components/providers/WebSocketProvider';

export const metadata = {
  title: 'Todo App - High-End UI',
  description: 'Premium task management interface with cinematic depth design',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased">
        <AuthProvider>
          <WebSocketProvider>
            <NotificationProvider>
              <AccessibilityProvider>
                {children}
              </AccessibilityProvider>
            </NotificationProvider>
          </WebSocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}