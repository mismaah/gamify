import { NextPage } from "next";
import React, { useEffect, useState } from "react";
import { Layout } from "../../components/common/layout";
import { api } from "../../utils/api";
import { Spin, Statistic } from "antd";
import { countAccumulated, timeDuration } from "../../utils/helpers";
import dayjs from "dayjs";
import "dayjs/plugin/relativeTime";
import { Rates } from "../../components/item/rates";
import { Usage } from "../../components/item/usage";

dayjs.extend(require("dayjs/plugin/relativeTime"));

const Item: NextPage<{ id: number }> = ({ id }) => {
  const getItem = api.item.get.useQuery({ id });

  const [accumulated, setAccumulated] = useState(0);
  const [nextInSec, setNextInSec] = useState<number | null>(null);

  const updateNumbers = () => {
    const [a, n] = countAccumulated(getItem?.data?.rates);
    setAccumulated(a);
    setNextInSec(n);
  };

  useEffect(() => {
    if (getItem?.data) {
      updateNumbers();
    }
  }, [getItem?.data]);

  useEffect(() => {
    if (getItem?.data) {
      var handle = setInterval(updateNumbers, 1000);
      return () => {
        clearInterval(handle);
      };
    }
  });

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
                  value={accumulated - getItem.data.usage.length}
                />
                {nextInSec && (
                  <Statistic
                    title="Next in"
                    value={nextInSec}
                    formatter={(value) => timeDuration(value as number)}
                  />
                )}
              </div>
            }
            <Usage item={getItem.data} />
            <Rates item={getItem.data} />
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
