import React, { useState, useEffect } from "react";
import { Table } from "antd";
import { format } from "date-fns";
import "./style.css"; 

export const ResourceList = () => {
  const [resources, setResources] = useState([]);
  const [userUnitId, setUserUnitId] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("authUser"));
    setUserUnitId(user?.unitId);

    fetch(`${process.env.REACT_APP_API_URL}/api/resources`)
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
  ];

  return (
    <div className="resource-list-container">
      <h2>Список наявних ресурсів</h2>
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
