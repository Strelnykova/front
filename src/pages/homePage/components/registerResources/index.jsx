import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Row, Col, Spin } from 'antd';
import './style.css';  

export const RegisterResources = () => {
  const [form] = Form.useForm();
  const [units, setUnits] = useState([]); 
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);  

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('authUser'));
    setAuthUser(user);

    fetch(`${process.env.REACT_APP_API_URL}/api/units/`)
      .then((response) => response.json())
      .then((data) => {
        setUnits(data);
        setLoading(false);  
      })
      .catch((error) => {
        console.error('Помилка при завантаженні підрозділів:', error);
        setLoading(false);  
      });
  }, []);

  const handleSubmit = (values) => {
    const resourceData = {
      ...values,
      unit: authUser ? authUser.unitId : null,  
    };

    fetch(`${process.env.REACT_APP_API_URL}/api/resources`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resourceData),
    })
      .then((response) => response.json())
      .then((data) => {
        message.success('Ресурс успішно створено!');
        window.location.reload();
      })
      .catch((error) => {
        console.error('Помилка при створенні ресурсу:', error);
      });
  };

  if (loading || !authUser) {
    return (
      <div className="create-resource-container">
        <h2>Завантаження...</h2>
        <Spin size="large" />
      </div>
    );
  }

  const selectedUnit = units.find(unit => unit.id === authUser.unitId)?.name;

  return (
    <div className="create-resource-container">
      <h2>Створити ресурс</h2>
      <Form
        form={form}
        onFinish={handleSubmit}
        layout="vertical"
        initialValues={{
          unit: authUser ? selectedUnit : null,  
        }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Тип ресурсу"
              name="type"
              rules={[{ required: true, message: 'Будь ласка, введіть тип ресурсу!' }]}
            >
              <Input placeholder="Тип ресурсу" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Назва ресурсу"
              name="name"
              rules={[{ required: true, message: 'Будь ласка, введіть назву ресурсу!' }]}
            >
              <Input placeholder="Назва ресурсу" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Кількість"
              name="quantity"
              rules={[{ required: true, message: 'Будь ласка, введіть кількість!' }]}
            >
              <Input placeholder="Кількість" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Підрозділ"
              name="unit"
              rules={[{ required: true, message: 'Підрозділ вже визначено!' }]}
            >
              <Input
                value={selectedUnit ? selectedUnit.name : 'Підрозділ не знайдено'}
                readOnly
                placeholder="Підрозділ"
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label="Опис"
              name="description"
            >
              <Input.TextArea rows={4} placeholder="Опис ресурсу" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Створити ресурс
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};
