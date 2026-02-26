import { Button, Spin, Statistic } from "antd";
import dayjs from "dayjs";
import "dayjs/plugin/relativeTime";
import { NextPage } from "next";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Layout } from "../../components/common/layout";
import { Rates } from "../../components/item/rates";
import { Usage } from "../../components/item/usage";
import { api } from "../../utils/api";
import { DATETIME_FORMATS, timeDuration } from "../../utils/helpers";

const ItemAnalytics = dynamic(
  () =>
    import("../../components/item/item-analytics").then((m) => m.ItemAnalytics),
  { ssr: false, loading: () => <Spin size="large" /> }
);

dayjs.extend(require("dayjs/plugin/relativeTime"));

const Item: NextPage<{ id: number }> = ({ id }) => {
  const getItem = api.item.get.useQuery({ id });

  const [accumulated, setAccumulated] = useState(0);
  const [nextInSec, setNextInSec] = useState<number | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Sync from server
  useEffect(() => {
    if (getItem.data) {
      setAccumulated(getItem.data.accumulated);
      setNextInSec(getItem.data.nextInSec);
    }
  }, [getItem.data]);

  // Countdown timer
  useEffect(() => {
    if (!getItem.data?.currentRatePerSec) return;
    const ratePerSec = getItem.data.currentRatePerSec;
    const handle = setInterval(() => {
      setNextInSec((prev) => {
        if (prev === null) return null;
        const next = prev - 1;
        if (next <= 0) {
          setAccumulated((a) => a + 1);
          return 1 / ratePerSec;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(handle);
  }, [getItem.data?.currentRatePerSec]);

  return (
    <>
      <Layout>
        <h3 className="text-2xl font-bold text-white">{getItem.data?.name}</h3>
        {getItem.isLoading && <Spin size="large" />}
        {getItem.data && (
          <>
            {
              <div className=" w-72">
                <Statistic
                  title="Available"
                  value={accumulated - getItem.data.usageCount}
                />
                {nextInSec && (
                  <Statistic
                    title="Next in"
                    value={nextInSec}
                    formatter={(value) => timeDuration(value as number)}
                  />
                )}
                <Statistic
                  title={`Total since ${dayjs(
                    getItem.data.firstUsageDate
                  ).format(DATETIME_FORMATS.date)}`}
                  value={getItem.data.usageCount}
                />
              </div>
            }
            <Usage itemId={getItem.data.id} />
            <Rates item={getItem.data} />
            {showAnalytics ? (
              <ItemAnalytics itemId={getItem.data.id} />
            ) : (
              <Button type="primary" onClick={() => setShowAnalytics(true)}>
                Show Analytics
              </Button>
            )}
          </>
        )}
      </Layout>
    </>
  );
};

Item.getInitialProps = async (ctx) => {
  return { id: parseInt(ctx.query.id as string) };
};

export default Item;
