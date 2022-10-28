declare var fingerprint: any;
export {};

declare global {
  // @ts-ignore
  interface Window {
    requestIdleCallback: (
      callback: IdleRequestCallback,
      options?: IdleRequestOptions | undefined
    ) => number;
  }
}

declare module 'LZString';
