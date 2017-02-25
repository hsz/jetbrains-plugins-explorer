import cheerio from 'cheerio';
import Q from 'q';
import request from 'request-promise';
import sortBy from 'lodash/sortBy';

const PLUGIN_URL = 'https://plugins.jetbrains.com/idea/plugin';

console.log('# Jetbrains Plugins Repositories List');
console.log('## This is a listing of all JetBrains (IntelliJ, Android Studio, PhpStorm, WebStorm, ' +
    'PyCharm, AppCode) 3rd party plugins repositories.');
console.log('I don\'t count here all plugins (because they can be found [here](https://plugins.jetbrains.com/) ' +
    '- only those with specified URL to the public sources repository (BitBucket or GitHub).\n');
console.log('This repository can be used as a good starting point for plugins development - it\'s always good ' +
    'to check how the others have solved their problems!\n');
console.log('*Good luck!*\n\n');
console.log('| Plugin name | Downloads | Last update | Repository |');
console.log('| ----------- |:---------:|:-----------:| ---------- |');

const fetch = (max, parse, deferred = Q.defer(), promise = deferred.promise) => {
  for (let i = 1; i <= max; i++) {
    promise = promise.then((results) =>
        request(`${PLUGIN_URL}/${i}`)
            .then(result => results.concat(parse(cheerio.load(result))))
            .catch(() => results)
    );
  }
  deferred.resolve([]);
  return promise;
};

fetch(10000, ($) => ({
  name: $('.plugin-title').html().split('<br>').shift().trim(),
  update: $('.plugin-info__update').text().trim(),
  downloads: $('.plugin-info__downloads').text().trim(),
  url: $('.sidebar-box a')
      .map((i, el) => $(el).attr('href'))
      .toArray()
      .filter(href => href.indexOf('github') >= 0 || href.indexOf('bitbucket') >= 0)
      .shift(),
}))
    .then(response => sortBy(response.filter(({url}) => url), 'name'))
    .then(response => response.map(({name, downloads, update, url}) =>
        console.log(`| ${name} | ${downloads} | ${update} | ${url} |`))
    );
