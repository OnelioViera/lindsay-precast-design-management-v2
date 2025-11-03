import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import FormTemplate from '@/models/FormTemplate';

// GET /api/form-templates/active?type=customer
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const formType = searchParams.get('type');

    if (!formType || !['customer', 'project', 'library'].includes(formType)) {
      return NextResponse.json(
        { success: false, message: 'Invalid form type' },
        { status: 400 }
      );
    }

    const template = await FormTemplate.findOne({
      formType,
      isActive: true,
    }).lean();

    if (!template) {
      return NextResponse.json(
        { success: false, message: 'No active form template found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: template,
    });
  } catch (error) {
    console.error('Get active form template error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
