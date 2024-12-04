import React, { useState, useEffect, useRef } from 'react';
import { Table, Input, Button, Space, Spin } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { format } from 'date-fns';

export const ViewResources = () => {
  const [usedResources, setUsedResources] = useState([]);
  const [units, setUnits] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true); 
  const searchInput = useRef(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('authUser')); 
    setAuthUser(user);

    fetch(`${process.env.REACT_APP_API_URL}/api/used-resources/`)
      .then((response) => response.json())
      .then((data) => {
        setUsedResources(data);
      })
      .catch((error) => {
        console.error('Помилка при завантаженні даних:', error);
      });

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

    fetch(`${process.env.REACT_APP_API_URL}/api/users/`)
      .then((response) => response.json())
      .then((data) => {
        setUsers(data);
      })
      .catch((error) => {
        console.error('Помилка при завантаженні користувачів:', error);
      });
  }, []);

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Пошук по ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: 'block',
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Пошук
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Скинути
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({
                closeDropdown: false,
              });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Фільтрувати
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            Закрити
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? '#1677ff' : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    filterDropdownProps: {
      onOpenChange(open) {
        if (open) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: '#ffc069',
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const filteredResources = usedResources.filter(
    (resource) => resource.unitId === authUser?.unitId
  );

  const columns = [
    {
      title: 'Кількість використаних ресурсів',
      dataIndex: 'quantityUsed',
      key: 'quantityUsed',
      ...getColumnSearchProps('quantityUsed'),
    },
    {
      title: 'Опис',
      dataIndex: 'description',
      key: 'description',
      ...getColumnSearchProps('description'),
    },
    {
      title: 'Підрозділ',
      dataIndex: 'unitName',
      key: 'unitName',
      ...getColumnSearchProps('unitName'),
    },
    {
      title: 'Дата створення запиту',
      dataIndex: 'date',
      key: 'date',
      ...getColumnSearchProps('date'),
      render: (text) => format(new Date(text), 'dd-MM-yyyy HH:mm'),
    },
    {
      title: 'Користувач',
      dataIndex: 'userName',
      key: 'userName',
      ...getColumnSearchProps('userName'),
    },
  ];

  // Обробка даних для таблиці
  const processedData = filteredResources.map((resource) => ({
    key: resource.id,
    quantityUsed: resource.quantityUsed,
    description: resource.description,
    date: resource.createdAt,
    unitName: units.find((unit) => unit.id === resource.unitId)?.name || 'Невідомо',
    userName: users.find((user) => user.id === resource.userId)?.username || 'Невідомо',
  }));

  if (loading || !authUser) {
    return (
      <div className="create-resource-container">
        <h2>Завантаження...</h2>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Table
      columns={columns}
      dataSource={processedData}
      rowKey="key"
    />
  );
};
