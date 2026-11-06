import QRCode from "qrcode";

export interface QrOptions {
  width?: number;
  margin?: number;
  darkColor?: string;
  lightColor?: string;
}

/**
 * Generate a PNG Buffer for the given text/URL.
 */
export async function generateQrPng(
  text: string,
  options: QrOptions = {}
): Promise<Buffer> {
  const width = options.width || 512;
  const margin = options.margin !== undefined ? options.margin : 2;
  const dark = options.darkColor || "#000000";
  const light = options.lightColor || "#ffffff";

  return QRCode.toBuffer(text, {
    type: "png",
    width,
    margin,
    color: {
      dark,
      light,
    },
    errorCorrectionLevel: "M",
  });
}

/**
 * Generate an SVG string for the given text/URL.
 */
export async function generateQrSvg(
  text: string,
  options: QrOptions = {}
): Promise<string> {
  const margin = options.margin !== undefined ? options.margin : 2;
  const dark = options.darkColor || "#000000";
  const light = options.lightColor || "#ffffff";

  return QRCode.toString(text, {
    type: "svg",
    margin,
    color: {
      dark,
      light,
    },
    errorCorrectionLevel: "M",
  });
}

/**
 * Generate a Data URL (base64 PNG) for inline display.
 */
export async function generateQrDataUrl(
  text: string,
  options: QrOptions = {}
): Promise<string> {
  const width = options.width || 512;
  const margin = options.margin !== undefined ? options.margin : 2;
  const dark = options.darkColor || "#000000";
  const light = options.lightColor || "#ffffff";

  return QRCode.toDataURL(text, {
    type: "image/png",
    width,
    margin,
    color: {
      dark,
      light,
    },
    errorCorrectionLevel: "M",
  });
}

