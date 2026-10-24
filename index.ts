import path from 'path';
import dotenv from 'dotenv';
import {saveResult, CSV_FILE_NAME, loadProcessedFolders} from './utils/resultsStore.js';
import { findImageFolders, fileToBase64} from './utils/imageFiles.js';
import { buildPrompt, sendWithFallback } from './utils/aiApi.js';
import fs from 'fs';

dotenv.config();

async function processSingleSizeFolder(sizeFolderPath : string) {
  const size = path.basename(sizeFolderPath);

  const folders : { name: string; images: string[] }[] = (await findImageFolders(sizeFolderPath));
    if(process.env.DEBUG === 'true') {
      console.log('Items to process for size:', size, folders.length);
    }
  
  const resultPath = path.join(sizeFolderPath, CSV_FILE_NAME);
  const alreadyProcessedFolders = loadProcessedFolders(resultPath); 

  for (const { name: folder, images } of folders.filter(f => !alreadyProcessedFolders.has(f.name))) {
    if(process.env.DEBUG === 'true') {
      console.log(`Processing folder: ${folder}`);
      console.log('Images:', images);
    }
    try {
      const imageParts = images.map(imagePath => fileToBase64(imagePath));
    
      const result = await sendWithFallback(buildPrompt(size), imageParts);
      console.log(folder, result);      
      await saveResult(resultPath, folder, result);
    } catch (error) {
      console.error(`Błąd dla size ${size}, folder ${folder}:`, error);
    }
  }
}

async function run() {
  const sourceDir : string = process.env.SOURCE_DIR ?? (() => { throw new Error('SOURCE_DIR is not defined in .env file') })();
  console.log('Source directory:', sourceDir);
  const sizeDirsList = (await fs.promises.readdir(sourceDir, { withFileTypes: true })).filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);

  for (const dirName of sizeDirsList) {
    const sizeFolderPath = path.join(sourceDir, dirName);
    console.log('Processing size folder:', sizeFolderPath);
    await processSingleSizeFolder(sizeFolderPath);
  }
}

await run();