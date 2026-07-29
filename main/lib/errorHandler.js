import { NextResponse } from 'next/server';
import { z } from 'zod';

export function handleApiError(err) {
  if (err instanceof z.ZodError) {
    const issues = err.issues || err.errors || [];
    return NextResponse.json(
      { 
        message: issues[0]?.message || 'Validation failed', 
        details: issues,
        type: 'validation_error' 
      }, 
      { status: 422 }
    );
  }

  // Handle generic Node/Mongoose errors
  if (err.name === 'ValidationError') {
     return NextResponse.json({ message: err.message, type: 'validation_error' }, { status: 400 });
  }

  console.error('[API Error]:', err);
  
  const status = err.status && err.status >= 400 && err.status < 500 ? err.status : 500;
  const message = status === 500 ? 'An unexpected error occurred. Please try again.' : (err.message || 'Request failed');

  return NextResponse.json({ message }, { status });
}
