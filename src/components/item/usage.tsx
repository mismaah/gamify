import { DeleteOutlined } from "@ant-design/icons";
import { Button, message, Popconfirm, Table, Tooltip } from "antd";
import dayjs from "dayjs";
import "dayjs/plugin/relativeTime";
import React, { useState } from "react";
import { api } from "../../utils/api";
import { DATETIME_FORMATS } from "../../utils/helpers";
import { useIsSmallDevice } from "../../utils/hooks";
import { AddUse } from "./add-use";

export interface UsageProps {
  itemId: number;
}

export const Usage: React.FC<UsageProps> = ({ itemId }) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const usageQuery = api.usage.getAll.useQuery({ itemId, page, pageSize });

  const utils = api.useContext();
  const deleteUse = api.usage.delete.useMutation({
    onError: (err) => {
      message.error(err.message);
    },
    onSuccess: () => {
      utils.item.get.invalidate({ id: itemId });
      utils.usage.getAll.invalidate();
    },
  });

  const isSmallDevice = useIsSmallDevice();
  let actionColClasses = "flex gap-2";
  if (isSmallDevice) {
    actionColClasses += " flex-col";
  }

  return (
    <div className="flex min-w-[300px] flex-col gap-2">
      <AddUse itemId={itemId} />
      <Table
        rowKey="id"
        loading={usageQuery.isLoading}
        columns={[
          {
            title: "Created at",
            key: "createdAt",
            dataIndex: "createdAt",
            render: (createdAt) =>
              dayjs(createdAt).format(DATETIME_FORMATS.dayDateAndTime),
          },
          {
            title: "",
            key: "actions",
            render: (_, use) => (
              <div className={actionColClasses}>
                <AddUse itemId={itemId} use={use} />
                <Popconfirm
                  title="Delete use?"
                  onConfirm={() => deleteUse.mutate({ id: use.id })}
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
        dataSource={usageQuery.data?.data}
        pagination={{
          current: page,
          pageSize,
          total: usageQuery.data?.total,
          onChange: (p, ps) => {
            setPage(p);
            if (ps !== pageSize) setPageSize(ps);
          },
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} records`,
        }}
      />
    </div>
  );
};
