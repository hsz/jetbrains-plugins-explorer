import cheerio from 'cheerio';
import Q from 'q';
import request from 'request-promise';
import sortBy from 'lodash/sortBy';

const PLUGIN_URL = 'https://plugins.jetbrains.com/idea/plugin';
const DATE = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');

console.log('# Jetbrains Plugins Repositories List');
console.log('## This is a listing of all JetBrains (IntelliJ, Android Studio, PhpStorm, WebStorm, ' +
  'PyCharm, AppCode) 3rd party plugins repositories.');
console.log('Not every plugin is counted here- only those with specified URL to the public sources repository ' +
  '(BitBucket or GitHub). Full list of the plugins is available [here](https://plugins.jetbrains.com/).\n');
console.log('This repository can be used as a good starting point for plugins development - it\'s always good ' +
  'to check how the others have solved their problems!\n');
console.log('*Good luck!*\n\n');
console.log(`Generated: _${DATE}_\n\n\n`);
console.log('| Plugin name | Downloads | Last update | Repository |');
console.log('| ----------- |:---------:|:-----------:| ---------- |');

const fetch = (max, parse, deferred = Q.defer(), promise = deferred.promise) => {
  for (let i = 7495; i <= max; i++) {
    promise = promise.then((results) =>
      request(`${PLUGIN_URL}/${i}`)
        .then(result => results.concat(parse(i, cheerio.load(result))))
        .catch(() => results)
    );
  }
  deferred.resolve([]);
  return promise;
};

fetch(10200, (i, $) => ({
  name: $('.plugin-title')[0].firstChild.data.trim(),
  update: $('.plugin-info__update').text().trim(),
  downloads: $('.plugin-info__downloads').text().trim(),
  pluginUrl: `${PLUGIN_URL}/${i}`,
  url: $('.sidebar-box a')
    .map((i, el) => $(el).attr('href'))
    .toArray()
    .filter(href => href.indexOf('github') >= 0 || href.indexOf('bitbucket') >= 0)
    .shift(),
}))
  .then(response => sortBy(response.filter(({url}) => url), 'name'))
  .then(response => response.map(({name, downloads, update, pluginUrl, url}) =>
    console.log(`| [${name}](${pluginUrl}) | ${downloads} | ${update} | ${url} |`))
  );
