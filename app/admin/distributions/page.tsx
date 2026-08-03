import { Distribution } from "@/models/Distribution";
import connectMongoose from "@/lib/db";
import { Package } from "lucide-react";
import { revalidatePath } from "next/cache";

interface DistributionItem {
  _id: { toString: () => string };
  inventoryId?: {
    name?: string;
    medicineId?: {
      name?: string;
    };
  };
  recipientName: string;
  recipientType: string;
  quantity: number;
  status: string;
}

export default async function DistributionsPage() {
  await connectMongoose();
  const distributions = await Distribution.find().sort({ createdAt: -1 }).populate({
    path: 'inventoryId',
    model: 'Inventory',
    populate: {
      path: 'medicineId',
      model: 'Medicine'
    }
  }).lean() as unknown as DistributionItem[];

  async function updateStatus(formData: FormData) {
    "use server";
    await connectMongoose();
    const id = formData.get("id") as string;
    const status = formData.get("status") as string;
    await Distribution.findByIdAndUpdate(id, { status });
    revalidatePath("/admin/distributions");
  }

  return (
    <div className="min-h-screen bg-[#F5F2EC] p-8 noise-bg">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-serif text-[#3E492B] mb-8">Outbound Logistics</h1>
        
        <div className="bg-white rounded-xl border border-[#ddd8cf] overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F5F2EC] border-b border-[#ddd8cf]">
                <th className="p-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Medicine Name</th>
                <th className="p-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Recipient</th>
                <th className="p-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Type</th>
                <th className="p-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Quantity</th>
                <th className="p-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Status</th>
                <th className="p-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {distributions.map((dist: DistributionItem) => (
                <tr key={dist._id.toString()} className="border-b border-[#ddd8cf] last:border-0 hover:bg-[#F5F2EC]/50 transition-colors">
                  <td className="p-4 text-gray-900 font-medium">
                    {dist.inventoryId?.medicineId?.name || dist.inventoryId?.name || "Unknown Medicine"}
                  </td>
                  <td className="p-4 text-gray-900 font-medium">{dist.recipientName}</td>
                  <td className="p-4 text-gray-500 text-sm capitalize">{dist.recipientType.replace('_', ' ')}</td>
                  <td className="p-4 text-gray-900">{dist.quantity} units</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      dist.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      dist.status === 'in_transit' ? 'bg-blue-100 text-blue-700' :
                      dist.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {dist.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4">
                    <form action={updateStatus} className="flex gap-2">
                      <input type="hidden" name="id" value={dist._id.toString()} />
                      <select 
                        name="status" 
                        defaultValue={dist.status}
                        className="bg-[#F5F2EC] border border-[#ddd8cf] rounded text-sm px-2 py-1 text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#3E492B]"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_transit">In Transit</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <button type="submit" className="bg-[#3E492B] text-white px-3 py-1 rounded text-sm hover:bg-[#2d361f] transition-colors">
                        Update
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {distributions.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    No distributions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
