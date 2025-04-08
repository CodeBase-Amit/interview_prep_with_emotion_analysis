import React from 'react';
import Link from 'next/link';
import { auth } from '@/firebase/admin';
import { COOKIE_NAME } from '@/lib/constants';
import { Metadata } from 'next';
import '../globals.css';
import { Inter } from 'next/font/google';
import { cookies } from 'next/headers';
import { getCurrentCompany } from '@/lib/actions/auth.action';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Admin Dashboard | Interview Prep',
  description: 'Manage interview questions and feedback',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check authentication in protected routes
  let isAuthenticated = false;
  let companyName = '';
  
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(COOKIE_NAME)?.value;
    
    if (sessionCookie) {
      try {
        // Verify the session cookie
        const decodedClaims = await auth.verifySessionCookie(sessionCookie);
        
        if (decodedClaims && decodedClaims.uid) {
          isAuthenticated = true;
          
          // Get company info
          const company = await getCurrentCompany();
          if (company) {
            companyName = company.name;
          }
        }
      } catch (error) {
        console.error('Error verifying session cookie:', error);
      }
    }
  } catch (error) {
    console.error('Error in layout:', error);
  }
  
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <header className="bg-dark-300 border-b border-dark-100">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
              <Link href="/" className="flex items-center gap-2">
                <span className="font-bold text-xl">InterviewPrep</span>
                <span className="bg-primary-200 text-dark-800 text-xs px-2 py-1 rounded">ADMIN</span>
              </Link>
              
              <nav>
                {isAuthenticated ? (
                  <div className="flex items-center gap-4">
                    {companyName && (
                      <span className="text-light-400 text-sm mr-4">
                        {companyName}
                      </span>
                    )}
                    <Link 
                      href="/admin/company" 
                      className="text-light-100 hover:text-primary-100"
                    >
                      Dashboard
                    </Link>
                    <Link 
                      href="/admin/company/upload" 
                      className="text-light-100 hover:text-primary-100"
                    >
                      Upload Questions
                    </Link>
                    <Link 
                      href="/admin/company/feedback" 
                      className="text-light-100 hover:text-primary-100"
                    >
                      Feedback
                    </Link>
                    <Link 
                      href="/api/auth/signout"
                      className="bg-dark-200 hover:bg-dark-100 px-4 py-2 rounded-lg text-light-100"
                    >
                      Sign Out
                    </Link>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link 
                      href="/admin/sign-in" 
                      className="text-light-100 hover:text-primary-100"
                    >
                      Sign In
                    </Link>
                    <Link 
                      href="/admin/sign-up" 
                      className="bg-primary-200 hover:bg-primary-100 text-dark-800 px-4 py-2 rounded-lg"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </nav>
            </div>
          </header>
          
          <main className="flex-grow container mx-auto px-4 py-6">
            {children}
          </main>
          
          <footer className="bg-dark-300 border-t border-dark-100 py-6">
            <div className="container mx-auto px-4 text-center text-light-300 text-sm">
              © {new Date().getFullYear()} InterviewPrep. All rights reserved.
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
} 