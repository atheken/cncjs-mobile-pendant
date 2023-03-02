export class DirectoryEntry {
  name: string;
  type: 'f' | 'd';
  size: number;
  atime: Date;
  mtime: Date;
  ctime: Date;
}

export default class DirectoryListing {
  path: string = '';
  files: DirectoryEntry[] = [];
}
