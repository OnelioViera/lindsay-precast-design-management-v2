import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import FormTemplate from '@/models/FormTemplate';

// GET /api/admin/form-templates
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const formType = searchParams.get('formType');

    const query: any = {};
    if (formType) query.formType = formType;

    const templates = await FormTemplate.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    console.error('Get form templates error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/form-templates
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    await connectDB();

    const template = await FormTemplate.create({
      name: body.name,
      description: body.description || '',
      formType: body.formType,
      fields: body.fields || [],
      isActive: true,
      version: 1,
      createdBy: (session.user as any).id,
    });

    return NextResponse.json({
      success: true,
      message: 'Form template created successfully',
      data: template,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Create form template error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
