import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Customer from '@/models/Customer';
import { customerSchema } from '@/lib/validations';

// GET /api/customers - Get all customers
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const query: any = {};
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { 'contactInfo.email': new RegExp(search, 'i') },
      ];
    }

    const skip = (page - 1) * limit;
    const [customers, total] = await Promise.all([
      Customer.find(query)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Customer.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        customers,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get customers error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/customers - Create new customer
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = customerSchema.parse(body);

    await connectDB();

    // Check if customer already exists
    const existingCustomer = await Customer.findOne({
      'contactInfo.email': validatedData.contactInfo?.email?.toLowerCase?.() || null,
    });

    if (existingCustomer) {
      return NextResponse.json(
        { success: false, message: 'Customer with this email already exists' },
        { status: 400 }
      );
    }

    const customer = await Customer.create({
      ...validatedData,
      contactInfo: {
        ...validatedData.contactInfo,
        email: validatedData.contactInfo?.email?.toLowerCase?.() || '',
      },
      projectHistory: {
        totalProjects: 0,
        activeProjects: 0,
        completedThisYear: 0,
        recentProjectIds: [],
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Customer created successfully',
      data: {
        id: customer._id.toString(),
        name: customer.name,
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error('Create customer error:', error);

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



