import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import fs from 'fs';

export const CSV_FILE_NAME = 'results.csv';
const SEP = ',';

export async function saveResult(resultPath: string, folderNo: string, result: any) {  
  const isNew = !fs.existsSync(resultPath);
  const csv = stringify(
    [{ folderNo: folderNo, title: result.title, description: result.description }],
    { header: isNew, columns: ['folderNo', 'title', 'description'], delimiter: SEP }
  );
  try {
  // BOM tylko przy tworzeniu pliku, żeby Excel poprawnie pokazał polskie znaki
    await fs.promises.appendFile(resultPath, (isNew ? '\uFEFF' : '') + csv, 'utf8');
  } catch (error) {
    console.error(`Błąd zapisu do pliku ${resultPath}:`, error);
  }
}

export function loadProcessedFolders(resultPath: string) {
const alreadyProcessedFolders = new Set();
  if (fs.existsSync(resultPath)) {
    const rows : any[] =  parse(fs.readFileSync(resultPath, 'utf8'), { columns: true, delimiter: SEP, bom: true, skip_empty_lines: true }); 
    for (const row of rows) {
      console.log('Already processed folder:', row.folderNo);
      alreadyProcessedFolders.add(row.folderNo);
    }
  } 
  return alreadyProcessedFolders;
}