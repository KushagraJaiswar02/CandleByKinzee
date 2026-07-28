import { NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/lib/auth.js';
import { connectDB } from '@/lib/mongodb.js';
import { Admin } from '@/lib/models/Admin.js';

export async function GET(request) {
  try {
    await connectDB();
    const adminSession = getAdminFromRequest(request);
    if (!adminSession) {
      return NextResponse.json({ message: 'Admin login required' }, { status: 401 });
    }
    const admin = await Admin.findById(adminSession.sub).select('_id email role');
    if (!admin) {
      return NextResponse.json({ message: 'Admin login required' }, { status: 401 });
    }
    return NextResponse.json({ admin: { email: admin.email, role: admin.role } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
