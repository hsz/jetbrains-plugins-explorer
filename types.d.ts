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

export interface Plugin {
  id: number;
  name: string;
  link: string;
  approve: boolean;
  description: string;
  preview: string;
  docText: string;
  email: string;
  family: string; // enum?
  downloads: number;
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
  icon: string;

  update: string;
}

export interface Update {
  id: number;
  link: string;
  version: string;
  approve: boolean;
  listed: boolean;
  cdate: string;
  file: string;
  notes: string;
  since: string;
  until: string;
  sinceUntil: string;
  channel: string;
  size: number;
  compatibleVersions: {
    [key: string]: string;
  };
}
