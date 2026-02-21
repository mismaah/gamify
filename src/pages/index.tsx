import { Spin, message } from "antd";
import { type NextPage } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "~/utils/api";
import { Layout } from "../components/common/layout";
import { AddItem } from "../components/item/add-item";
import { timeDuration } from "../utils/helpers";

interface DisplayItem {
  id: number;
  name: string;
  description: string;
  accumulated: number;
  nextInSec: number | null;
  currentRatePerSec: number | null;
  usageCount: number;
}

const Home: NextPage = () => {
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const itemsQuery = api.item.getAll.useQuery({ page, pageSize });

  const [displayItems, setDisplayItems] = useState<DisplayItem[]>([]);

  // Sync from server
  useEffect(() => {
    if (itemsQuery.data) {
      setDisplayItems(itemsQuery.data.items);
    }
  }, [itemsQuery.data]);

  // Countdown timer
  useEffect(() => {
    const handle = setInterval(() => {
      setDisplayItems((prev) =>
        prev.map((item) => {
          if (!item.currentRatePerSec || item.nextInSec === null) return item;
          let nextInSec = item.nextInSec - 1;
          let accumulated = item.accumulated;
          if (nextInSec <= 0) {
            accumulated += 1;
            nextInSec = 1 / item.currentRatePerSec;
          }
          return { ...item, accumulated, nextInSec };
        })
      );
    }, 1000);
    return () => clearInterval(handle);
  }, []);

  const utils = api.useContext();
  const mutation = api.usage.createOrUpdate.useMutation({
    onSuccess: () => {
      mutation.reset();
      utils.item.getAll.invalidate();
    },
    onError: (error) => {
      message.error(error.message);
    },
  });

  const totalPages = itemsQuery.data
    ? Math.ceil(itemsQuery.data.total / pageSize)
    : 0;

  return (
    <>
      <Layout>
        <div>
          <AddItem />
        </div>
        {itemsQuery.isLoading && <Spin size="large" />}
        <div className="flex max-w-[700px] flex-wrap justify-around gap-4">
          {displayItems.map((item) => (
            <Link href={`/items/${item.id}`} key={item.id}>
              <div
                className="flex w-[200px] cursor-pointer flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
                onContextMenu={(e) => {
                  e.preventDefault();
                  mutation.mutate({
                    id: null,
                    itemId: item.id,
                    createdAt: null,
                  });
                }}
              >
                <h3 className="flex justify-between font-bold">
                  <div className="text-2xl">{item.name}</div>
                  <div className="text-xl">
                    {item.accumulated - item.usageCount}
                  </div>
                </h3>
                {item.nextInSec && (
                  <div className="opacity-50">
                    Next in {timeDuration(item.nextInSec)}
                  </div>
                )}
                {item.description && (
                  <div className="text-lg opacity-80">{item.description}</div>
                )}
              </div>
            </Link>
          ))}
        </div>
        {totalPages > 1 && (
          <div className="mt-4 flex gap-2">
            <button
              className="rounded bg-white/10 px-3 py-1 text-white hover:bg-white/20 disabled:opacity-30"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </button>
            <span className="py-1 text-white">
              Page {page} of {totalPages}
            </span>
            <button
              className="rounded bg-white/10 px-3 py-1 text-white hover:bg-white/20 disabled:opacity-30"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        )}
      </Layout>
    </>
  );
};

export default Home;
