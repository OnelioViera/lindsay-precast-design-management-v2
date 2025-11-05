import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Notification from '@/models/Notification';

// Mark this route as dynamic since it requires authentication
export const dynamic = 'force-dynamic';

// GET /api/notifications
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      console.log('📬 GET /api/notifications - No session');
      return NextResponse.json(
        {
          success: true,
          data: [],
          unreadCount: 0,
        },
        { status: 200 }
      );
    }

    const userId = (session.user as any).id;
    if (!userId) {
      console.log('📬 GET /api/notifications - No userId in session');
      return NextResponse.json(
        {
          success: true,
          data: [],
          unreadCount: 0,
        },
        { status: 200 }
      );
    }

    console.log('📬 GET /api/notifications for user:', userId);

    // Handle "admin-env" case - env-based admin doesn't have notifications
    if (userId === 'admin-env') {
      console.log('  📬 Admin (env-based) - returning empty notifications');
      return NextResponse.json(
        {
          success: true,
          data: [],
          unreadCount: 0,
        },
        { status: 200 }
      );
    }

    try {
      await connectDB();
    } catch (dbError) {
      console.error('❌ Database connection error:', dbError);
      // Return empty notifications instead of error
      return NextResponse.json(
        {
          success: true,
          data: [],
          unreadCount: 0,
        },
        { status: 200 }
      );
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    const query: any = { userId };
    if (unreadOnly) query.read = false;

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const unreadCount = await Notification.countDocuments({
      userId,
      read: false,
    });

    console.log(`  Found ${notifications.length} notifications (${unreadCount} unread)`);

    return NextResponse.json({
      success: true,
      data: notifications,
      unreadCount,
    });
  } catch (error) {
    console.error('❌ Get notifications error:', error);
    if (error instanceof Error) {
      console.error('   Message:', error.message);
      console.error('   Stack:', error.stack);
    }
    // Return empty notifications on error instead of 500
    return NextResponse.json(
      {
        success: true,
        data: [],
        unreadCount: 0,
      },
      { status: 200 }
    );
  }
}

// POST /api/notifications
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    // Only admins can create notifications
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    await connectDB();

    // Get all users
    const User = (await import('@/models/User')).default;
    const users = await User.find({ _id: { $ne: (session.user as any).id } });

    // Create notifications for all users except the admin
    const notifications = await Notification.insertMany(
      users.map((user: any) => ({
        userId: user._id,
        type: body.type,
        title: body.title,
        message: body.message,
        data: body.data || {},
      }))
    );

    return NextResponse.json({
      success: true,
      message: 'Notifications created',
      count: notifications.length,
    }, { status: 201 });
  } catch (error) {
    console.error('Create notification error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
