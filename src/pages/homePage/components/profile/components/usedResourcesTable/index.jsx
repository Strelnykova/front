import React, { useState, useEffect } from "react";
import { Table, Button, Input, message } from "antd";
import { format } from "date-fns";
import "./style.css";

export const UsedResourcesTable = () => {
  const [usedResources, setUsedResources] = useState([]);
  const [userId, setUserId] = useState(null);
  const [selectedQuantity, setSelectedQuantity] = useState(null);
  const [selectedResourceId, setSelectedResourceId] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState("");
  

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("authUser"));
    setUserId(user?.id);

    fetch(`${process.env.REACT_APP_API_URL}/api/used-resources`)
      .then((response) => response.json())
      .then((data) => {
        const filteredResources = data.filter((resource) => resource.userId === user?.id);
        setUsedResources(filteredResources);
      })
      .catch((error) => {
        console.error("Помилка при завантаженні використаних ресурсів:", error);
      });
  }, [userId]);

  const parseQuantity = (quantityWithUnit) => {
    const match = quantityWithUnit.match(/(\d+)\s*(\D+)/);
    if (match) {
      return { quantity: parseInt(match[1]), unit: match[2].trim() };
    }
    return { quantity: 0, unit: "" };
  };

  const handleWriteOff = () => {
    if (!selectedQuantity || selectedQuantity <= 0) {
      message.error("Будь ласка, введіть коректну кількість для списання.");
      return;
    }

    const selectedResource = usedResources.find(
      (resource) => resource.id === selectedResourceId
    );

    const { quantity, unit } = parseQuantity(selectedResource.quantityUsed);

    if (selectedQuantity > quantity) {
      message.error("Недостатньо ресурсів для списання.");
      return;
    }

    const newQuantity = quantity - selectedQuantity;

    const updatedResources = usedResources.map((resource) => {
      if (resource.id === selectedResourceId) {
        const newQuantity = quantity - selectedQuantity;
        return {
          ...resource,
          quantityUsed: newQuantity > 0 ? `${newQuantity} ${unit}` : "Списано",
        };
      }
      return resource;
    });

    setUsedResources(updatedResources);

    fetch(`${process.env.REACT_APP_API_URL}/api/used-resources/${selectedResourceId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...selectedResource,
        quantityUsed: newQuantity > 0 ? `${newQuantity} ${unit}` : "Списано",
      }),
    })
      .then((response) => response.json())
      .then(() => {
        message.success("Ресурс успішно списано!");
      })
      .catch((error) => {
        console.error("Помилка при оновленні ресурсу:", error);
        message.error("Помилка при списанні ресурсу.");
      });
  };

  const formatDate = (date) => format(new Date(date), "dd-MM-yyyy HH:mm");

  const columns = [
    {
      title: "Назва ресурсу",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Кількість використана",
      dataIndex: "quantityUsed",
      key: "quantityUsed",
    },
    {
      title: "Дата створення",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => formatDate(text),
    },
    {
      title: "Вибрати кількість для списання",
      key: "selectQuantity",
      render: (text, record) => (
        <div>
          <Input
            type="number"
            min={1}
            max={parseQuantity(record.quantityUsed).quantity}
            value={selectedResourceId === record.id ? selectedQuantity : ""}
            onChange={(e) => {
              setSelectedQuantity(Number(e.target.value));
              setSelectedUnit(parseQuantity(record.quantityUsed).unit);
              setSelectedResourceId(record.id);
            }}
            placeholder="Введіть кількість"
          />
        </div>
      ),
    },
    {
      title: "Дія",
      key: "action",
      render: (text, record) => (
        <Button
          onClick={handleWriteOff}
          type="primary"
          disabled={selectedResourceId !== record.id || !selectedQuantity}
        >
          Списати
        </Button>
      ),
    },
  ];

  return (
    <div className="used-resources-container">
      <h2>Використані ресурси</h2>
      <Table
        columns={columns}
        dataSource={usedResources}
        rowKey="id"
        pagination={{ pageSize: 5 }}
        bordered
        responsive
      />
    </div>
  );
};
