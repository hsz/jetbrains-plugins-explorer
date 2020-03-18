import { ISocialShareProps } from '@webteam/social-share';

interface Config {
  socialShare: Partial<ISocialShareProps>;
}

interface Vendor {
  name: string;
  url: string;
}

interface Tag {
  id: number;
  name: string;
  privileged: boolean;
  link: string;
}

export interface JBSearchResponse {
  id: number;
  xmlId: string;
  link: string;
  name: string;
  preview: string;
  downloads: number;
  icon: string;
  previewImage: string;
  lastUpdateDate: number;
  rating: number;
  hasSource: boolean;
}

export interface JBPluginsResponse extends JBSearchResponse {
  approve: boolean;
  description: string;
  docText: string;
  email: string;
  family: string; // enum?
  vendor: Vendor;
  urls: {
    url: string;
    forumUrl: string;
    licenseUrl: string;
    bugtrackerUrl: string;
    docUrl: string;
    sourceCodeUrl: string;
  };
  tags: Tag[];
  removalRequested: boolean;
  hasUnapprovedUpdate: boolean;
  readyForSale: boolean;
  screenshots: string[];

  repository: string;
}

export interface Plugin extends JBPluginsResponse {
  branch: string;
  kotlin: boolean;
  gradle: boolean;
  extensions: {
    [key: string]: string[];
  };
}

export interface JBSearchResult {
  plugins: JBSearchResponse[];
  total: number;
  correctedQuery: string;
}

export interface GHSearchResult {
  total_count: number;
  incomplete_results: boolean;
  items: SearchItem[];
}

export interface GHReposResult {
  default_branch: string;
}

export interface GHTreesResult {
  sha: string;
  url: string;
  tree: {
    path: string;
    mode: string;
    type: string;
    sha: string;
    size: number;
    url: string;
  }[];
  truncated: boolean;
}

interface SearchItem {
  name: string;
  path: string;
}
