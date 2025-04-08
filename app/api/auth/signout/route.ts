'use server'

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE_NAME } from '@/lib/constants';

// Handle both POST and GET requests for sign-out
export async function POST(request: NextRequest) {
  return handleSignOut(request);
}

export async function GET(request: NextRequest) {
  return handleSignOut(request);
}

async function handleSignOut(request: NextRequest) {
  try {
    // Clear the session cookie
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, '', {
      expires: new Date(0),
      path: '/',
    });

    // Check if there's a redirect URL in the query parameters
    const { searchParams } = new URL(request.url);
    const redirectTo = searchParams.get('redirect_to') || '/admin/sign-in';

    // Redirect to the specified URL
    return NextResponse.redirect(new URL(redirectTo, request.url));
  } catch (error) {
    console.error('Error during sign-out:', error);
    
    // If there's an error, still redirect to sign-in
    return NextResponse.redirect(new URL('/admin/sign-in', request.url));
  }
} 