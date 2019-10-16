import moment from 'moment';
import { defer } from 'q';
import axios from 'axios';
import { isEmpty, sortBy } from 'lodash';
import { Plugin, Update } from './types';

const ENDPOINT = 'https://plugins.jetbrains.com/api/plugins';
const MAX_PLUGIN_ID = 100;
const MAX_FAILS = 475;
const DATE = new Date()
  .toISOString()
  .replace(/T/, ' ')
  .replace(/\..+/, '');

console.log('# Jetbrains Plugins Repositories List');
console.log(
  '## This is a listing of all JetBrains (IntelliJ, Android Studio, PhpStorm, WebStorm, PyCharm, ' +
    'AppCode) 3rd party plugins repositories.',
);
console.log(
  'Not every plugin is counted here - only those with specified URL to the public sources ' +
    'repository  (BitBucket or GitHub). Full list of the plugins is available ' +
    '[here](https://plugins.jetbrains.com/).\n',
);
console.log(
  "This repository can be used as a good starting point for plugins development - it's always " +
    'good to check how the others have solved their problems!\n',
);
console.log('*Good luck!*\n\n');
console.log(`Generated: _${DATE}_\n\n\n`);
console.log('| Plugin name | Downloads | Last update | Repository |');
console.log('| ----------- | ---------:| ----------- | ---------- |');

let fail = 0;

const fetch = (max: number, deferred = defer<Plugin[]>(), promise = deferred.promise) => {
  for (let i = 0; i <= max; i++) {
    promise = promise.then(results =>
    {
      if (fail >= MAX_FAILS) {
        return Promise.resolve(results);
      }

      return axios
        .get<Plugin>(`${ENDPOINT}/${i}`)
        .then(response => {
          if (isEmpty(response.data.urls.sourceCodeUrl)) {
            throw new Error('no sourceCodeUrl');
          }
          return response;
        })
        .catch(error => {
          ++fail;
          throw error;
        })
        .then(result => {
          fail = 0;
          return axios.get<Update[]>(`${ENDPOINT}/${i}/updates?size=1`).then(updates =>
            results.concat({
              ...result.data,
              update: moment(+updates.data[0].cdate).format('YYYY-MM-DD'),
            }),
          );
        })
        .catch(() => results);
    },
    );
  }

  deferred.resolve([]);

  return promise;
};

fetch(MAX_PLUGIN_ID)
  .then(response => sortBy(response.filter(({ urls: { sourceCodeUrl } }) => sourceCodeUrl), 'name'))
  .then(response =>
    response.map(({ name, downloads, update, urls: { sourceCodeUrl, url } }) =>
      console.log(`| [${name}](${sourceCodeUrl}) | ${downloads} | ${update} | ${url} |`),
    ),
  );
