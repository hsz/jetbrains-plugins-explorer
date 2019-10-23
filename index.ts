import moment from 'moment';
import axios from 'axios';
import { isEmpty, sortBy } from 'lodash';
import { Plugin, Update } from './types';

const ENDPOINT = 'https://plugins.jetbrains.com/api/plugins';
const MAX_FAILS = 475;
const DATE = new Date()
  .toISOString()
  .replace(/T/, ' ')
  .replace(/\..+/, '');

console.log('# Jetbrains Plugins Repositories List');
console.log(
  '## This is a daily update listing of all JetBrains (IntelliJ, Android Studio, PhpStorm, ' +
    'WebStorm, PyCharm, AppCode) 3rd party plugins repositories.',
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
console.log('| Plugin name | Downloads | Last<span>&nbsp;</span>update |');
console.log('| ----------- | ---------:| ----------------------------- |');

let fail = 0;

const fetch = (id = 1, data: Plugin[] = []): Promise<Plugin[]> =>
  axios
    .get<Plugin>(`${ENDPOINT}/${id}`)
    .then(response => {
      if (isEmpty(response.data.urls.sourceCodeUrl)) {
        throw new Error('no sourceCodeUrl');
      }
      return response.data;
    })
    .then(result =>
      axios.get<Update[]>(`${ENDPOINT}/${result.id}/updates?size=1`).then(updates => ({
        ...result,
        downloads: result.downloads.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '),
        update: moment(+updates.data[(fail = 0)].cdate).format('YYYY-MM-DD'),
      })),
    )
    .then(response => fetch(id + 1, data.concat(response)))
    .catch(() => (++fail >= MAX_FAILS ? Promise.resolve(data) : fetch(id + 1, data)));

fetch()
  .then(response => sortBy(response.filter(({ urls: { sourceCodeUrl } }) => sourceCodeUrl), 'name'))
  .then(response =>
    response.forEach(({ name, downloads, update, urls: { sourceCodeUrl } }) =>
      console.log(`| [${name}](${sourceCodeUrl}) | ${downloads} | ${update} |`),
    ),
  );
