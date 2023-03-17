import { Rate } from "@prisma/client";
import {
  Modal,
  Button,
  InputNumber,
  DatePicker,
  Form,
  Select,
  message,
  Tooltip,
} from "antd";
import React, { useState } from "react";
import { api } from "~/utils/api";
import dayjs, { Dayjs } from "dayjs";
import { DATETIME_FORMATS } from "../../utils/helpers";
import { EditOutlined, PlusCircleOutlined } from "@ant-design/icons";

export interface AddRateProps {
  itemId: number;
  rate?: Rate;
}

export const AddRate: React.FC<AddRateProps> = ({ itemId, rate }) => {
  let title = "Add Rate";
  let icon = <PlusCircleOutlined />;
  if (rate) {
    title = "Edit";
    icon = <EditOutlined />;
  }
  const [visible, setVisible] = useState(false);

  const [form] = Form.useForm();

  const handleCancel = () => {
    setVisible(false);
    form.resetFields();
  };

  const utils = api.useContext();
  const mutation = api.rate.createOrUpdate.useMutation({
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
      <Tooltip title={title}>
        <Button
          onClick={() => setVisible(true)}
          size={rate ? "small" : "middle"}
          type="link"
          icon={icon}
        />
      </Tooltip>
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
            rate
              ? {
                  from: dayjs(rate.from),
                  to: rate.to ? dayjs(rate.to) : null,
                  value: rate.value,
                  unit: rate.unit,
                }
              : {}
          }
          onFinish={({
            from,
            to,
            value,
            unit,
          }: {
            from: Dayjs;
            to: Dayjs | null;
            value: number;
            unit: string;
          }) => {
            if (to && (to.isSame(from, "day") || to.isBefore(from, "day"))) {
              message.error("To date must be after from date.");
              return;
            }
            mutation.mutate({
              id: rate ? rate.id : null,
              itemId,
              from: from.startOf("day").toDate(),
              to: to ? to.startOf("day").toDate() : null,
              value,
              unit,
            });
          }}
        >
          <div className="flex gap-2 ">
            <Form.Item
              label="From"
              name="from"
              className="flex-1"
              rules={[
                { required: true, message: "Please input a start date." },
              ]}
            >
              <DatePicker format={DATETIME_FORMATS.date} className="w-full" />
            </Form.Item>
            <Form.Item label="To" name="to" className="flex-1">
              <DatePicker format={DATETIME_FORMATS.date} className="w-full" />
            </Form.Item>
          </div>
          <div className="flex gap-2">
            <Form.Item
              label="Rate"
              name="value"
              className="flex-1"
              rules={[{ required: true, message: "Please input a value." }]}
            >
              <InputNumber
                placeholder="Enter rate"
                className="w-full"
                precision={2}
              />
            </Form.Item>
            <Form.Item
              label="Per"
              name="unit"
              className="flex-1"
              rules={[{ required: true, message: "Please select a unit." }]}
            >
              <Select>
                <Select.Option value="Minute">Minute</Select.Option>
                <Select.Option value="Hour">Hour</Select.Option>
                <Select.Option value="Day">Day</Select.Option>
                <Select.Option value="Week">Week</Select.Option>
                <Select.Option value="Month">Month</Select.Option>
                <Select.Option value="Year">Year</Select.Option>
              </Select>
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
