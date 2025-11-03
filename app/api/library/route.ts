import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Library from '@/models/Library';
import { libraryTemplateSchema } from '@/lib/validations';

// GET /api/library
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const active = searchParams.get('active') !== 'false';

    const query: any = {};
    if (category) query.productCategory = category;
    if (active) query.isActive = true;

    const templates = await Library.find(query)
      .sort({ usageCount: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    console.error('Get library error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/library
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !['engineer', 'manager', 'admin'].includes((session.user as any).role)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = libraryTemplateSchema.parse(body);

    await connectDB();

    const template = await Library.create({
      ...validatedData,
      createdBy: (session.user as any).id,
      usageCount: 0,
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      message: 'Template created successfully',
      data: {
        id: template._id.toString(),
        templateName: template.templateName,
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error('Create template error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}


