import TimeAgo from 'react-timeago';
import styled from '@emotion/styled';
import { difference, flatten, isEmpty, keys, sortBy, uniqBy } from 'lodash';
import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { Select, Table, Tag } from 'antd';
import { Plugin } from 'types';
import { ColumnsType } from 'antd/lib/table/interface';
import Extensions from './Extensions';

const DATA_URL =
  'https://raw.githubusercontent.com/hsz/jetbrains-plugins-explorer/master/src/data/data.json';

const columns = (plugins: Plugin[]): ColumnsType<Plugin> => {
  const tagsFilters = sortBy(
    uniqBy(
      flatten(plugins.map(({ tags }) => tags || [])).map(({ name, id }) => ({
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
      render: (name, plugin) => (
        <a href={`https://plugins.jetbrains.com/plugin/${plugin.id}`}>{name}</a>
      ),
    },
    {
      title: 'Repository',
      dataIndex: 'repository',
      render: repository => <a href={`https://github.com/${repository}`}>{repository}</a>,
    },
    {
      title: 'Downloads',
      dataIndex: 'downloads',
      render: downloads => `${downloads}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' '),
      align: 'right',
    },
    {
      title: 'Last updated',
      dataIndex: 'lastUpdateDate',
      render: lastUpdateDate => <TimeAgo date={lastUpdateDate} />,
    },
    {
      title: 'Extensions',
      dataIndex: 'extensions',
      render: extensions => <Tag>{keys(extensions).length}</Tag>,
      align: 'center',
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      render: (tags: Plugin['tags']) => tags.map(tag => <Tag key={tag.id}>{tag.name}</Tag>),
      filters: tagsFilters,
      onFilter: (value, record) => record.tags.find(tag => tag.id === +value) !== undefined,
    },
  ];
};

const StyledSelect = styled(Select)`
  width: 100%;
`;

const App = () => {
  const [data, setData] = useState<Plugin[]>([]);
  const [selectedExtensions, setSelectedExtensions] = useState<string[]>([]);

  useEffect(() => {
    axios.get(DATA_URL).then(response => {
      setData(response.data);
    });
  }, []);

  const handleExtensionsChange = useCallback(v => {
    setSelectedExtensions(v);
  }, []);

  const extensions = flatten(
    data.reduce<string[]>((acc, plugin) => acc.concat(keys(plugin.extensions)), []),
  );
  const filteredData = data.filter(plugin =>
    isEmpty(difference(selectedExtensions, keys(plugin.extensions))),
  );

  return (
    <>
      <h1>
        JetBrains Plugins Explorer;
        <a href="https://github.com/hsz/jetbrains-plugins-explorer">GitHub</a>
      </h1>
      <Table
        columns={columns(data)}
        dataSource={filteredData}
        expandable={{
          expandedRowRender: record => <Extensions plugin={record} />,
          rowExpandable: record => !isEmpty(record.extensions),
        }}
        loading={isEmpty(data)}
        rowKey="id"
        title={() => (
          <StyledSelect
            allowClear
            mode="multiple"
            placeholder="Please select extensions"
            size="large"
            onChange={handleExtensionsChange}
          >
            {extensions.map(extension => (
              <Select.Option key={extension} value={extension}>
                {extension}
              </Select.Option>
            ))}
          </StyledSelect>
        )}
      />
    </>
  );
};

export default App;
