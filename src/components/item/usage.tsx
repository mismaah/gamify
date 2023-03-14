import React from "react";
import { Table, Button, Popconfirm, message } from "antd";
import { DATETIME_FORMATS } from "../../utils/helpers";
import dayjs from "dayjs";
import "dayjs/plugin/relativeTime";
import { Item, Use } from "@prisma/client";
import { api } from "../../utils/api";
import { AddUse } from "./add-use";

export interface UsageProps {
  item: Item & {
    usage: Use[];
  };
}

export const Usage: React.FC<UsageProps> = ({ item }) => {
  const utils = api.useContext();
  const deleteRate = api.usage.delete.useMutation({
    onError: (err) => {
      message.error(err.message);
    },
    onSuccess: () => {
      utils.item.get.invalidate({ id: item.id });
    },
  });

  return (
    <div className="flex min-w-[300px] flex-col gap-2">
      {item && <AddUse itemId={item.id} />}
      <Table
        rowKey="id"
        columns={[
          {
            title: "Created at",
            key: "createdAt",
            dataIndex: "createdAt",
            render: (createdAt) =>
              dayjs(createdAt).format(DATETIME_FORMATS.dateAndTime),
          },
          {
            title: "",
            key: "actions",
            render: (_, use) => (
              <div className="flex gap-2">
                {item && <AddUse itemId={item.id} use={use} />}
                <Popconfirm
                  title="Delete use?"
                  onConfirm={() => deleteRate.mutate({ id: use.id })}
                >
                  <Button size="small" danger>
                    Delete
                  </Button>
                </Popconfirm>
              </div>
            ),
          },
        ]}
        dataSource={item.usage}
      />
    </div>
  );
};
