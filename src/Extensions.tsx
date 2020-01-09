import { toPairs } from 'lodash';
import React, { FunctionComponent } from 'react';
import { Plugin } from 'types';

interface Props {
  plugin: Plugin;
}

const Extensions: FunctionComponent<Props> = ({ plugin: { branch, extensions, repository } }) => (
  <div>
    <strong>Available extensions:</strong>
    <ul>
      {toPairs<string[]>(extensions).map(([key, entries]) => (
        <li key={key}>
          {key}:
          <ul>
            {entries.map(entry => (
              <li key={entry}>
                <a href={`https://github.com/${repository}/blob/${branch}/${entry}`}>{entry}</a>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  </div>
);

export default Extensions;
