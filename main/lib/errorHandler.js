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
  
  return NextResponse.json(
    { message: err.message || 'Internal server error' }, 
    { status: 500 }
  );
}
