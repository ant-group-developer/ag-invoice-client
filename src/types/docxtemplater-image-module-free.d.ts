declare module 'docxtemplater-image-module-free' {
  interface ImageModuleOptions {
    centered?: boolean;
    getImage?: (tagValue: string) => Uint8Array | null;
    getSize?: () => [number, number];
  }

  class ImageModule {
    constructor(options?: ImageModuleOptions);
  }

  export = ImageModule;
}
