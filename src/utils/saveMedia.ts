import fs from 'fs';
import path from 'path';

export async function saveLocalImage(image: string): Promise<string> {

  const fileName = Date.now().toString();
  const extension = image.split(';')[0].split('/')[1];
  const filePath = path.join(__dirname, 'files', fileName + extension);

  try {

    const base64Image = image.replace(/^data:image\/png;base64,/, "");

    await fs.writeFileSync(filePath, base64Image, { encoding: 'base64' });

    return filePath;

  } catch (error) {
    throw new Error('Cannot save local media file. Description: ' + error.message);
  }
}
