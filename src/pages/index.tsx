import { Item, Rate, Use } from "@prisma/client";
import { Spin } from "antd";
import { type NextPage } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "~/utils/api";
import { Layout } from "../components/common/layout";
import { AddItem } from "../components/item/add-item";
import { countAccumulated, timeDuration } from "../utils/helpers";

const Home: NextPage = () => {
  const items = api.item.getAll.useQuery();

  const [accumulated, setAccumulated] = useState<
    {
      accumulated: number;
      nextInSec: number | null;
      item: Item & {
        rates: Rate[];
        usage: Use[];
      };
    }[]
  >([]);

  const updateNumbers = () => {
    if (items.data) {
      const numbers = [];
      for (const item of items.data) {
        const [accumulated, nextInSec] = countAccumulated(item.rates);
        numbers.push({
          accumulated,
          nextInSec,
          item,
        });
      }
      setAccumulated(numbers);
    }
  };

  useEffect(() => {
    if (items?.data) {
      updateNumbers();
    }
  }, [items?.data]);

  useEffect(() => {
    if (items) {
      var handle = setInterval(updateNumbers, 1000);
      return () => {
        clearInterval(handle);
      };
    }
  });

  return (
    <>
      <Layout>
        <div>
          <AddItem />
        </div>
        {items.isLoading && <Spin size="large" />}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-8">
          {items.data &&
            accumulated.map((acc) => (
              <Link href={`/items/${acc.item.id}`} key={acc.item.id}>
                <div
                  key={acc.item.id}
                  className="flex max-w-xs cursor-pointer flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
                >
                  <h3 className="flex justify-between font-bold">
                    <div className="text-2xl">{acc.item.name}</div>
                    <div className="text-xl">
                      {acc.accumulated - acc.item.usage.length}
                    </div>
                  </h3>
                  {acc.nextInSec && (
                    <div className="opacity-50">
                      Next in {timeDuration(acc.nextInSec as number)}
                    </div>
                  )}
                  {acc.item.description && (
                    <div className="text-lg opacity-80">
                      {acc.item.description}
                    </div>
                  )}
                </div>
              </Link>
            ))}
        </div>
      </Layout>
    </>
  );
};

export default Home;
