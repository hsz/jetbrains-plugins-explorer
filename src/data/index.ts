import axios from 'axios';
import fs from 'fs';
import { get, identity, isEmpty, last, mapValues, omit, omitBy, padStart, uniq } from 'lodash';
import path from 'path';
import { xml2js } from 'xml-js';
import { GHReposResult, GHTreesResult, JBPluginsResponse, JBSearchResult, Plugin } from 'types';

// @ts-ignore
const { TOKEN } = process.env;

const JB_API_ENDPOINT = 'https://plugins.jetbrains.com/api';
const GH_API_ENDPOINT = `https://api.github.com`;
const GH_RAW_ENDPOINT = `https://raw.githubusercontent.com`;
const MAX = 10;

const axiosError = (error: any) => {
  throw new Error(`${error.response.data.message} -> ${error.config.url}`);
};

const api = {
  fetchPlugins: () =>
    axios
      .get<JBSearchResult>(`${JB_API_ENDPOINT}/searchPlugins`, {
        params: { max: MAX, shouldHaveSource: true, isIDERequest: false },
      })
      .then(({ data: { plugins } }) => plugins)
      .catch(axiosError),

  fetchPluginDetails: (id: number) =>
    axios
      .get<JBPluginsResponse>(`${JB_API_ENDPOINT}/plugins/${id}`)
      .catch(axiosError)
      .then(({ data }) => {
        const repository = (Object.values(data.urls)
          .join()
          .match(/github\.com\/([^/]+\/[^/,]+)/) || [])[1];

        if (isEmpty(repository)) {
          throw new Error('GitHub repository missing');
        }
        return { ...data, repository };
      }),

  fetchRepositoryPaths: (repo: string) => {
    const headers = {
      Authorization: `Bearer ${TOKEN}`,
    };

    const request = (branch: string) =>
      axios
        .get<GHTreesResult>(`${GH_API_ENDPOINT}/repos/${repo}/git/trees/${branch}?recursive=1`, {
          headers,
        })
        .catch(axiosError)
        .then(({ data }) => ({ paths: data.tree.map(({ path }) => path), branch }));

    return request('master').catch(() =>
      axios
        .get<GHReposResult>(`${GH_API_ENDPOINT}/repos/${repo}`, { headers })
        .catch(axiosError)
        .then(({ data: { default_branch } }) => default_branch)
        .then(request),
    );
  },

  fetchManifest: (repo: string, branch: string, path: string) =>
    axios.get<string>(`${GH_RAW_ENDPOINT}/${repo}/${branch}/${path}`).then(({ data }) =>
      xml2js(data, {
        alwaysArray: true,
        alwaysChildren: true,
        compact: true,
        nativeType: true,
        instructionHasAttributes: true,
        ignoreCdata: true,
        ignoreComment: true,
      }),
    ),
};

api
  .fetchPlugins()
  .then(async plugins => {
    const result: Plugin[] = [];
    let n = 0;

    for (const plugin of plugins) {
      console.log(
        padStart(`${++n}/${plugins.length}`, 10),
        padStart(`-> ${plugin.id}`, 10),
        '  ',
        plugin.name,
        `(${plugin.xmlId})`,
      );

      try {
        const details = await api.fetchPluginDetails(plugin.id);
        const { paths, branch } = await api.fetchRepositoryPaths(details.repository);
        const getPath = (filename: string | undefined) =>
          filename && paths.find(path => path.includes(filename));

        const manifestPath = getPath('plugin.xml');
        if (manifestPath === undefined) {
          throw new Error('Manifest missing');
        }
        const manifest = await api.fetchManifest(details.repository, branch, manifestPath);
        const extensions: Plugin['extensions'] = omitBy(
          mapValues(
            omit(get(manifest, ['idea-plugin', 0, 'extensions', 0]), '_attributes'),
            implementations =>
              uniq<string>(
                implementations
                  .map((implementation: any[]) =>
                    getPath(
                      last<string>(
                        (
                          get(implementation, ['_attributes', 'implementation']) ||
                          get(implementation, ['_attributes', 'implementationClass']) ||
                          get(implementation, ['_attributes', 'serviceImplementation']) ||
                          get(implementation, ['_attributes', 'class']) ||
                          get(implementation, ['_attributes', 'instance']) ||
                          ''
                        ).split('.'),
                      ),
                    ),
                  )
                  .filter(identity),
              ),
          ),
          isEmpty,
        );

        result.push({ ...plugin, ...details, extensions });
      } catch (e) {
        console.error(e.message);
      }
    }
    return result;
  })
  .then(plugins => fs.writeFileSync(path.join(__dirname, 'data.json'), JSON.stringify(plugins)));
