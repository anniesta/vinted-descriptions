import fs from "fs";
import path from "path";

const MIME_TYPES : { [key: string]: string } = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export function isImage(filename : string) {
  return path.extname(filename).toLowerCase() in MIME_TYPES;
}

export function fileToBase64(filePath : string) {
  const mimeType = MIME_TYPES[path.extname(filePath).toLowerCase()];
  if (!mimeType) throw new Error(`Nieobsługiwane rozszerzenie: ${filePath}`);

  const fileData = fs.readFileSync(filePath);
  return { inlineData: { data: fileData.toString("base64"), mimeType } };
}


export async function findImageFolders(rootDir : string) {
    const imageFolders : { name: string; path: string; images: string[] }[] = [];

    async function walkDir(currentDir : string) {
        //console.log('Checking directory:', currentDir);
        const entries = await fs.promises.readdir(currentDir, { withFileTypes: true });
        const images = [];
        for (const entry of entries) {
            const fullPath = path.join(currentDir, entry.name); 
            if(entry.isDirectory()) {
                await walkDir(fullPath);
            } else if (entry.isFile() && isImage(entry.name)) {
                images.push(fullPath);
            }   
        }
        if (images.length > 0) {
            imageFolders.push({ name: path.relative(rootDir, currentDir), path: currentDir, images });
        }
    }

    await walkDir(rootDir);
    return imageFolders;
}