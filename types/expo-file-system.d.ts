// Type declarations for expo-file-system
declare module "expo-file-system" {
  export interface FileInfo {
    exists: boolean;
    isDirectory?: boolean;
    uri: string;
    size?: number;
    modificationTime?: number;
    md5?: string;
  }

  export interface ReadingOptions {
    encoding?: "utf8" | "base64";
    length?: number;
    position?: number;
  }

  export interface WritingOptions {
    encoding?: "utf8" | "base64";
  }

  export interface DownloadOptions {
    md5?: boolean;
    cache?: boolean;
    headers?: { [key: string]: string };
    sessionType?: number;
  }

  export interface DownloadResult {
    uri: string;
    status: number;
    headers: { [key: string]: string };
    md5?: string;
  }

  export interface UploadOptions {
    headers?: { [key: string]: string };
    httpMethod?: "POST" | "PUT" | "PATCH";
    sessionType?: number;
    uploadType?: number;
  }

  export interface UploadResult {
    status: number;
    headers: { [key: string]: string };
    body: string;
  }

  export interface MakeDirectoryOptions {
    intermediates?: boolean;
  }

  export interface DeleteOptions {
    idempotent?: boolean;
  }

  export interface CopyOptions {
    from: string;
    to: string;
  }

  export interface MoveOptions {
    from: string;
    to: string;
  }

  export const documentDirectory: string | null;
  export const cacheDirectory: string | null;
  export const bundleDirectory: string | null;

  export function getInfoAsync(fileUri: string): Promise<FileInfo>;
  export function readAsStringAsync(
    fileUri: string,
    options?: ReadingOptions
  ): Promise<string>;
  export function writeAsStringAsync(
    fileUri: string,
    contents: string,
    options?: WritingOptions
  ): Promise<void>;
  export function deleteAsync(fileUri: string, options?: DeleteOptions): Promise<void>;
  export function moveAsync(options: MoveOptions): Promise<void>;
  export function copyAsync(options: CopyOptions): Promise<void>;
  export function makeDirectoryAsync(
    fileUri: string,
    options?: MakeDirectoryOptions
  ): Promise<void>;
  export function readDirectoryAsync(fileUri: string): Promise<string[]>;
  export function downloadAsync(
    uri: string,
    fileUri: string,
    options?: DownloadOptions
  ): Promise<DownloadResult>;
  export function uploadAsync(
    url: string,
    fileUri: string,
    options?: UploadOptions
  ): Promise<UploadResult>;
  export function getFreeDiskStorageAsync(): Promise<number>;
  export function getTotalDiskCapacityAsync(): Promise<number>;
}
