declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    margin?: number | number[];
    filename?: string;
    image?: { type?: string; quality?: number };
    html2canvas?: any;
    jsPDF?: any;
  }

  interface Html2PdfBuilder {
    from(element: HTMLElement | string): Html2PdfBuilder;
    set(options: Html2PdfOptions): Html2PdfBuilder;
    save(): Promise<void>;
    outputPdf(): Promise<any>;
  }

  function html2pdf(): Html2PdfBuilder;
  function html2pdf(element: HTMLElement, options?: Html2PdfOptions): Html2PdfBuilder;

  export default html2pdf;
}
