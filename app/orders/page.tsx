import { auth, currentUser } from "@clerk/nextjs/server";
import { client } from "@/sanity/lib/client";
import { groq } from "next-sanity";
import { PriceDisplay } from "@/components/app/PriceDisplay";

export const dynamic = "force-dynamic";

const ordersByEmailQuery = groq`
  *[_type == "order" && email == $email] | order(_createdAt desc) {
    _id,
    _createdAt,
    orderNumber,
    total,
    status,
    items[]{
      productName,
      quantity,
      price
    }
  }
`;

type OrderItem = {
  productName?: string;
  quantity?: number;
  price?: number;
};

type Order = {
  _id: string;
  _createdAt: string;
  orderNumber?: string;
  total?: number;
  status?: string;
  items?: OrderItem[];
};

function formatStatus(status?: string): string {
  if (!status) return "Pending";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default async function OrdersPage() {
  const { userId } = auth();
  if (!userId) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
            <p className="text-gray-700">
              Please sign in to view your order history.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress;

  if (!email) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
            We could not find an email on your account yet, so we cannot match your order history.
          </p>
        </div>
      </main>
    );
  }

  const orders = await client.fetch<Order[]>(ordersByEmailQuery, { email });

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
        <p className="mt-2 text-gray-600">Showing orders for {email}</p>

        {orders.length === 0 ? (
          <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
            <p className="text-gray-700">No orders found yet.</p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {orders.map((order) => (
              <article
                key={order._id}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {order.orderNumber || "Order"}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {new Date(order._createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                    {formatStatus(order.status)}
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  {(order.items || []).map((item, index) => (
                    <div
                      key={`${order._id}-${index}`}
                      className="flex items-center justify-between text-sm text-gray-700"
                    >
                      <span>
                        {item.productName || "Item"} x {item.quantity || 1}
                      </span>
                      <span>€{(item.price || 0).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 border-t border-gray-100 pt-4 text-right">
                  <span className="text-sm text-gray-600">Total: </span>
                  <span className="text-lg font-bold text-gray-900">
                    <PriceDisplay amount={order.total || 0} baseCurrency="EUR" />
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

