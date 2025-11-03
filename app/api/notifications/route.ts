import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Notification from '@/models/Notification';

// GET /api/notifications
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    console.log('📬 GET /api/notifications for user:', userId);

    await connectDB();

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
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
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
