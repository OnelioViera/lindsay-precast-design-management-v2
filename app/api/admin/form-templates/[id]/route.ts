import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import FormTemplate from '@/models/FormTemplate';

// GET /api/admin/form-templates/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const template = await FormTemplate.findById(params.id).lean();

    if (!template) {
      return NextResponse.json(
        { success: false, message: 'Form template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: template,
    });
  } catch (error) {
    console.error('Get form template error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/form-templates/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    console.log('📝 PATCH request body:', JSON.stringify(body, null, 2));
    
    await connectDB();

    const updateData = {
      name: body.name,
      description: body.description,
      fields: body.fields,
      isActive: body.isActive,
      updatedBy: (session.user as any).id,
    };

    console.log('🔄 Updating form template with:', JSON.stringify(updateData, null, 2));

    const template = await FormTemplate.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: false }
    ).catch((err) => {
      console.error('❌ Update error:', err);
      throw err;
    });

    if (!template) {
      return NextResponse.json(
        { success: false, message: 'Form template not found' },
        { status: 404 }
      );
    }

    console.log('✅ Form template updated successfully');

    // Create notification for all users
    try {
      const Notification = (await import('@/models/Notification')).default;
      const User = (await import('@/models/User')).default;
      const adminId = (session.user as any).id;
      const users = await User.find({ _id: { $ne: adminId } });

      console.log('🔔 NOTIFICATION DEBUG:');
      console.log('  Admin ID:', adminId);
      console.log('  Total users:', users.length);
      console.log('  Users found:', users.map((u: any) => ({ id: u._id.toString(), email: u.email })));

      const formTypeLabels: Record<string, string> = {
        customer: 'Customer Form',
        project: 'Project Form',
        library: 'Library Form',
      };

      if (users.length > 0) {
        const notificationDocs = users.map((user: any) => ({
          userId: user._id,
          type: 'form_updated',
          title: `${formTypeLabels[template.formType] || 'Form'} Updated`,
          message: `The ${formTypeLabels[template.formType] || 'form'} has been updated. Changes will take effect when you refresh.`,
          data: {
            formType: template.formType,
            formName: template.name,
            templateId: template._id,
          },
        }));

        console.log('  Creating notifications for:', notificationDocs.length, 'users');
        const result = await Notification.insertMany(notificationDocs);
        console.log('  ✅ Notifications created:', result.length);
      } else {
        console.log('  ⚠️  No other users found to notify');
      }
    } catch (notificationError) {
      console.error('❌ Error creating notifications:', notificationError);
      // Don't fail the form update if notifications fail
    }

    return NextResponse.json({
      success: true,
      message: 'Form template updated successfully',
      data: template,
    });
  } catch (error) {
    console.error('❌ Update form template error:', error);
    if (error instanceof Error) {
      console.error('   Error message:', error.message);
      console.error('   Error stack:', error.stack);
    }
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/form-templates/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const template = await FormTemplate.findByIdAndDelete(params.id);

    if (!template) {
      return NextResponse.json(
        { success: false, message: 'Form template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Form template deleted successfully',
    });
  } catch (error) {
    console.error('Delete form template error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
