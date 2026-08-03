import { Notification } from "@/models/Notification";
import connectMongoose from "@/lib/db";
import { auth } from "@/auth";
import { Bell, CheckCircle } from "lucide-react";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

interface NotificationItem {
  _id: { toString: () => string };
  read: boolean;
  title: string;
  message: string;
  createdAt: string | Date;
}

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  await connectMongoose();
  const notifications = await Notification.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .lean();

  async function markAsRead(formData: FormData) {
    "use server";
    const id = formData.get("id");
    if (id) {
      await connectMongoose();
      await Notification.findByIdAndUpdate(id, { read: true });
      revalidatePath("/notifications");
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F2EC] p-8 noise-bg">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-serif text-[#3E492B] mb-8 flex items-center gap-3">
          <Bell className="w-8 h-8" />
          Notifications
        </h1>

        <div className="space-y-4">
          {notifications.map((n: NotificationItem) => (
            <div key={n._id.toString()} className={`p-6 rounded-xl border flex gap-4 items-start ${n.read ? 'bg-white border-[#ddd8cf] opacity-75' : 'bg-[#F5F2EC] border-[#3E492B] shadow-sm'}`}>
              <div className={`p-2 rounded-full mt-1 ${n.read ? 'bg-gray-100 text-gray-500' : 'bg-[#3E492B] text-white'}`}>
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold ${n.read ? 'text-gray-700' : 'text-[#3E492B]'}`}>{n.title}</h3>
                <p className="text-gray-600 mt-1">{n.message}</p>
                <div className="text-xs text-gray-400 mt-2">
                  {new Date(n.createdAt).toLocaleString()}
                </div>
              </div>
              {!n.read && (
                <form action={markAsRead}>
                  <input type="hidden" name="id" value={n._id.toString()} />
                  <button type="submit" className="text-sm font-medium text-[#3E492B] hover:underline flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Mark Read
                  </button>
                </form>
              )}
            </div>
          ))}
          {notifications.length === 0 && (
            <div className="text-center p-12 bg-white rounded-xl border border-[#ddd8cf]">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">You have no notifications.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
