import { Use } from "@prisma/client";
import { Modal, Button, DatePicker, Form, message } from "antd";
import React, { useState } from "react";
import { api } from "~/utils/api";
import dayjs, { Dayjs } from "dayjs";
import { DATETIME_FORMATS } from "../../utils/helpers";

export interface AddUseProps {
  itemId: number;
  use?: Use;
}

export const AddUse: React.FC<AddUseProps> = ({ itemId, use }) => {
  let title = "Add Use";
  if (use) title = "Edit";
  const [visible, setVisible] = useState(false);

  const [form] = Form.useForm();

  const handleCancel = () => {
    setVisible(false);
    form.resetFields();
  };

  const utils = api.useContext();
  const mutation = api.usage.createOrUpdate.useMutation({
    onSuccess: () => {
      handleCancel();
      mutation.reset();
      utils.item.get.invalidate({ id: itemId });
    },
    onError: (error) => {
      message.error(error.message);
    },
  });

  return (
    <div>
      <Button
        loading={mutation.isLoading}
        onClick={() =>
          use
            ? setVisible(true)
            : mutation.mutate({ id: null, itemId, createdAt: null })
        }
        type={use ? "default" : "primary"}
        size={use ? "small" : "middle"}
      >
        {title}
      </Button>
      <Modal
        open={visible}
        title={title}
        onCancel={handleCancel}
        confirmLoading={mutation.isLoading}
        onOk={form.submit}
      >
        <Form
          preserve={false}
          form={form}
          labelAlign="right"
          className="mt-4"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          initialValues={
            use
              ? {
                  createdAt: dayjs(use.createdAt),
                }
              : {}
          }
          onFinish={({ createdAt }: { createdAt: Dayjs }) => {
            mutation.mutate({
              id: use ? use.id : null,
              itemId: null,
              createdAt: createdAt.toDate(),
            });
          }}
        >
          <Form.Item
            label="Created at"
            name="createdAt"
            className="flex-1"
            rules={[
              {
                required: true,
                message: "Please input created at date and time.",
              },
            ]}
          >
            <DatePicker
              format={DATETIME_FORMATS.dateAndTime}
              className="w-full"
              showTime={{ format: "HH:mm" }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
