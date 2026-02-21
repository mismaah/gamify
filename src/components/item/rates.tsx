import { DeleteOutlined } from "@ant-design/icons";
import type { Item, Rate } from "@prisma/generated";
import { Button, message, Popconfirm, Table, Tooltip } from "antd";
import dayjs from "dayjs";
import "dayjs/plugin/relativeTime";
import React from "react";
import { AddRate } from "../../components/item/add-rate";
import { api } from "../../utils/api";
import { DATETIME_FORMATS } from "../../utils/helpers";
import { useIsSmallDevice } from "../../utils/hooks";

export interface RatesProps {
  item: Item & {
    rates: Rate[];
  };
}

export const Rates: React.FC<RatesProps> = ({ item }) => {
  const utils = api.useContext();
  const deleteRate = api.rate.delete.useMutation({
    onError: (err) => {
      message.error(err.message);
    },
    onSuccess: () => {
      utils.item.get.invalidate({ id: item.id });
    },
  });

  const isSmallDevice = useIsSmallDevice();
  let actionColClasses = "flex gap-2";
  if (isSmallDevice) {
    actionColClasses += " flex-col";
  }

  return (
    <div className="flex min-w-[300px] flex-col gap-2">
      {item && <AddRate itemId={item.id} />}
      <Table
        rowKey="id"
        columns={[
          { title: "Rate", key: "value", dataIndex: "value" },
          { title: "Unit", key: "unit", dataIndex: "unit" },
          {
            title: "From",
            key: "from",
            dataIndex: "from",
            render: (from) => dayjs(from).format(DATETIME_FORMATS.date),
          },
          {
            title: "To",
            key: "to",
            dataIndex: "to",
            render: (to) =>
              to ? dayjs(to).format(DATETIME_FORMATS.date) : null,
          },
          {
            title: "",
            key: "actions",
            render: (_, rate) => (
              <div className={actionColClasses}>
                {item && <AddRate itemId={item.id} rate={rate} />}
                <Popconfirm
                  title="Delete rate?"
                  onConfirm={() => deleteRate.mutate({ id: rate.id })}
                >
                  <Tooltip title="Delete" placement="bottom">
                    <Button
                      size="small"
                      danger
                      type="link"
                      icon={<DeleteOutlined />}
                    />
                  </Tooltip>
                </Popconfirm>
              </div>
            ),
          },
        ]}
        dataSource={item.rates}
      />
    </div>
  );
};
