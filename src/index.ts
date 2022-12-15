import JSZip from "jszip";
import { logger } from "./services/logger";
import { Result, Err, Ok } from "ts-results";

const generateZipBlob = async (config: object) => {
  const zip = new JSZip();

  zip.file("config.json", JSON.stringify(config));

  return await zip.generateAsync({ type: "blob" });
};

enum UnzipFilesErrors {
  FileNotFound = "File not found",
  FailedUnzippingFile = "Failed unzipping file",
}

const unzipConfigFromBuffer = async (
  file: ArrayBuffer
): Promise<Result<string, UnzipFilesErrors>> => {
  const zip = new JSZip();

  let loadedFile: JSZip;
  try {
    loadedFile = await zip.loadAsync(file);
  } catch (err) {
    logger.error({ err }, UnzipFilesErrors.FailedUnzippingFile);
    return Err(UnzipFilesErrors.FailedUnzippingFile);
  }

  const helloTxtFile = loadedFile.file("config.json");

  if (helloTxtFile === null) {
    logger.error({ loadedFile }, UnzipFilesErrors.FailedUnzippingFile);
    return Err(UnzipFilesErrors.FileNotFound);
  }

  const result = await helloTxtFile.async("string");
  return Ok(result);
};

interface ENV {
  ZIP_BUCKET: R2Bucket;
}

export default {
  async fetch(request: Request, env: ENV): Promise<Response> {
    // Generate a zip file and upload it to the bucket
    const zippedFile = await generateZipBlob({
      config: "hello world",
    });

    await env.ZIP_BUCKET.put("zipfile", zippedFile);

    // download the bucket and unzip it
    const downloaded = await env.ZIP_BUCKET.get("zipfile");

    if (downloaded === null) {
      return new Response("File does not exist");
    }

    const buffer = await downloaded.arrayBuffer();
    const unzipped = await unzipConfigFromBuffer(buffer);

    return new Response(unzipped.val);
  },
};
