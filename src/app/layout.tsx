import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { FaCode } from 'react-icons/fa';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Mazen Tarek | Full-Stack Developer',
  description: 'Showcasing full-stack development skills with Next.js, Node.js, and MongoDB',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        <header className="bg-white shadow">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center py-4">
              <Link 
                href="/" 
                className="flex items-center text-2xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                <FaCode className="w-8 h-8" />
              </Link>
              <nav className="flex gap-6">
                <Link href="/" className="text-gray-700 hover:text-indigo-600">
                  Home
                </Link>
                <Link href="/task-manager" className="text-gray-700 hover:text-indigo-600">
                  Task Manager
                </Link>
                <Link href="/blog" className="text-gray-700 hover:text-indigo-600">
                  Blog
                </Link>
                <Link href="/e-commerce" className="text-gray-700 hover:text-indigo-600">
                  E-Commerce
                </Link>
                <Link href="/saas-dashboard" className="text-gray-700 hover:text-indigo-600">
                  SaaS Dashboard
                </Link>
              </nav>
            </div>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
} 