import { Injectable } from '@angular/core';
import { Filesystem } from '@capacitor/filesystem';
import { FilesystemOpResult } from '../typings/FilesystemOpResult';

@Injectable({
  providedIn: 'root'
})
export class IndexedDBService {

  constructor() { }

  async writeFile({ path, data }: { path: string, data: string }): Promise<FilesystemOpResult> {
    try {
      await Filesystem.writeFile({ path, data });
      return { data, path, success: true }
    } catch(error) {
      return { data, path, success: false, error }
    }
  }

  async readFile({ path }: { path: string }): Promise<FilesystemOpResult> {
    try {
      const { data } = await Filesystem.readFile({ path });
      return { data, path, success: true };
    } catch(error) {
      return { path, success: false, error };
    }
  }

  async deleteFile({ path }: { path: string }): Promise<FilesystemOpResult> {
    try {
      await Filesystem.deleteFile({ path });
      return { path,  success: true };
    } catch(error) {
      return { path, success: false };
    }
  }

  async popFile({ path }: { path: string }): Promise<FilesystemOpResult> {
    try {
      const { data } = await this.readFile({ path });
      await this.deleteFile({ path });
      return { path, data, success: true };
    } catch(error) {
      return { path, success: false, error };
    }
  }

  async deleteMultiple(...paths: string[]) {
    const unresolvedPromises = paths.map(async path => Filesystem.deleteFile({ path }));

    try {
      await Promise.all(unresolvedPromises);
      return { paths: [...paths], success: true };
    } catch(error) {
      return { paths: [...paths], success: false, error };
    }
  }
}
