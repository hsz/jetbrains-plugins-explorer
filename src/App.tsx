import { flatten, isEmpty, sortBy, uniqBy } from 'lodash';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Button, Table, Tag } from 'antd';
import { Plugin } from 'types';
import { ColumnsType } from 'antd/lib/table/interface';

const columns = (plugins: Plugin[]): ColumnsType<Plugin> => {
  const tagsFilters = sortBy(
    uniqBy(
      flatten(plugins.map(({ tags }) => tags)).map(({ name, id }) => ({
        text: name,
        value: `${id}`,
      })),
      'text',
    ),
    'text',
  );

  return [
    {
      title: 'Name',
      dataIndex: 'name',
    },
    {
      title: 'Last updated',
      dataIndex: 'lastUpdateDate',
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      render: (tags: Plugin['tags']) => (
        <span>
          {tags.map(tag => (
            <Tag key={tag.id}>{tag.name}</Tag>
          ))}
        </span>
      ),
      filters: tagsFilters,
      onFilter: (value, record) => record.tags.find(tag => tag.id === +value) !== undefined,
    },
  ];
};

const App = () => {
  const [data, setData] = useState<Plugin[]>([]);

  useEffect(() => {
    axios
      .get(
        'https://raw.githubusercontent.com/hsz/jetbrains-plugins-repositories-list/master/data.json',
      )
      .then(response => {
        setData(response.data);
      });
  }, []);

  return (
    <div>
      <header>
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <Button>xxx</Button>
        <a href="https://reactjs.org" target="_blank" rel="noopener noreferrer">
          Learn React
        </a>
      </header>
      <Table columns={columns(data)} dataSource={data} loading={isEmpty(data)} rowKey="id" />;
    </div>
  );
};

export default App;
