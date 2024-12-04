import React, { useState, useEffect } from "react";
import { Table, Button, Input, message } from "antd";
import { format } from "date-fns";
import "./style.css";

export const UseResources = () => {
  const [resources, setResources] = useState([]);
  const [userUnitId, setUserUnitId] = useState(null);
  const [selectedQuantity, setSelectedQuantity] = useState(null); 
  const [selectedResourceId, setSelectedResourceId] = useState(null); 
  const [selectedUnit, setSelectedUnit] = useState(""); 

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("authUser"));
    setUserUnitId(user?.unitId);

    fetch("http://localhost:4000/api/resources")
      .then((response) => response.json())
      .then((data) => {
        const filteredResources = data.filter(
          (resource) => resource.unit === userUnitId
        );
        setResources(filteredResources);
      })
      .catch((error) => {
        console.error("Помилка при завантаженні ресурсів:", error);
      });
  }, [userUnitId]);

  const parseQuantity = (quantityWithUnit) => {
    const match = quantityWithUnit.match(/(\d+)\s*(\D+)/); 
    if (match) {
      return { quantity: parseInt(match[1]), unit: match[2].trim() };
    }
    return { quantity: 0, unit: "" }; 
  };

  const handleUseResource = () => {
    if (!selectedQuantity || selectedQuantity <= 0) {
      message.error("Будь ласка, введіть кількість для використання.");
      return;
    }

    const selectedResource = resources.find(
      (resource) => resource.id === selectedResourceId
    );

    const { quantity, unit } = parseQuantity(selectedResource.quantity);

    if (selectedQuantity > quantity) {
      message.error("Недостатньо ресурсів для використання.");
      return;
    }

    const updatedResources = resources.map((resource) => {
      if (resource.id === selectedResourceId) {
        const newQuantity = quantity - selectedQuantity;
        return {
          ...resource,
          quantity: `${newQuantity} ${unit}`,
        };
      }
      return resource;
    });

    setResources(updatedResources);

    fetch(`${process.env.REACT_APP_API_URL}/api/resources/${selectedResourceId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...selectedResource,
        quantity: `${quantity - selectedQuantity} ${unit}`,
      }),
    })
      .then((response) => response.json())
      .then(() => {
        message.success("Ресурс успішно використано!");
        const user = JSON.parse(localStorage.getItem("authUser"));

        fetch(`${process.env.REACT_APP_API_URL}/api/used-resources`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resourceId: selectedResourceId,
            quantityUsed: `${selectedQuantity} ${selectedUnit}`, 
            unitId: user.unitId, 
            userId: user.id,     
            description: selectedResource.description, 
          }),
        })
          .then(() => message.success("Запис про використання ресурсу створено!"))
          .catch((error) => {
            console.error("Помилка при створенні запису в UsedResources:", error);
            message.error("Помилка при створенні запису.");
          });
      })
      .catch((error) => {
        console.error("Помилка при оновленні ресурсу:", error);
        message.error("Помилка при використанні ресурсу");
      });
  };

  const formatDate = (date) => format(new Date(date), "dd-MM-yyyy HH:mm");

  const columns = [
    {
      title: "Тип ресурсу",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Назва ресурсу",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Кількість",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity) => {
        const { quantity: num, unit } = parseQuantity(quantity);
        return `${num} ${unit}`;
      },
    },
    {
      title: "Опис",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Дата створення",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => formatDate(text),
    },
    {
      title: "Вибрати кількість для використання",
      key: "selectQuantity",
      render: (text, record) => (
        <div>
          <Input
            type="number"
            min={1}
            max={parseQuantity(record.quantity).quantity}
            value={selectedResourceId === record.id ? selectedQuantity : ""}
            onChange={(e) => {
              setSelectedQuantity(Number(e.target.value));
              setSelectedUnit(parseQuantity(record.quantity).unit); 
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
          onClick={handleUseResource}
          type="primary"
          disabled={selectedResourceId !== record.id || !selectedQuantity}
        >
          Підтвердити
        </Button>
      ),
    },
  ];

  return (
    <div className="resource-list-container">
      <h2>Список ресурсів, які дозволено використовувати</h2>
      <Table
        columns={columns}
        dataSource={resources}
        rowKey="id"
        pagination={{ pageSize: 5 }}
        bordered
        responsive
      />
    </div>
  );
};
