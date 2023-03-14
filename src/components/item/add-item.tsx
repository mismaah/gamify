import { Modal, Button, Input } from "antd";
import React, { useState } from "react";
import { api } from "~/utils/api";

export const AddItem: React.FC = () => {
  const title = "Add Item";
  const [visible, setVisible] = useState(false);
  const handleCancel = () => {
    setVisible(false);
    setName("");
  };

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const utils = api.useContext();
  const mutation = api.item.create.useMutation({
    onSuccess: () => {
      handleCancel();
      utils.item.getAll.invalidate();
    },
  });

  return (
    <div>
      <Button onClick={() => setVisible(true)} type="primary">
        {title}
      </Button>
      <Modal
        open={visible}
        title={title}
        onCancel={handleCancel}
        confirmLoading={mutation.isLoading}
        onOk={() => {
          if (name.trim() === "") return;
          mutation.mutate({ name, description });
        }}
      >
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter item name"
        ></Input>
        <Input
          className="mt-2"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter item description"
        ></Input>
      </Modal>
    </div>
  );
};
