declare module 'pdf-parse' {
  interface PDFVersion {
    str: string;
  }

  interface PDFInfo {
    PDFFormatVersion?: string;
    IsAcroFormPresent?: boolean;
    IsXFAPresent?: boolean;
    [key: string]: unknown;
  }

  interface PDFMetadata {
    [key: string]: unknown;
  }

  interface PDFData {
    numpages: number;
    numrender: number;
    info: PDFInfo;
    metadata: PDFMetadata;
    text: string;
    version: PDFVersion;
  }

  interface PDFOptions {
    pagerender?: (pageData: {
      getTextContent: () => Promise<{
        items: Array<{ str: string; transform: number[] }>;
      }>;
      pageIndex: number;
      pageNumber: number;
    }) => Promise<string> | string;
    max?: number;
    version?: string;
  }

  function PDFParse(dataBuffer: Buffer | Uint8Array, options?: PDFOptions): Promise<PDFData>;

  export = PDFParse;
}
