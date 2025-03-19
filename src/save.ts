import { resolve } from 'path';
import { promises } from 'fs';

export const save = async (text: string, path: string) => {
  const filePath = resolve(path);

  try {
    const data = await promises.readFile(filePath);

    if (data.toString() === text) {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    /* empty */
  }

  await promises.writeFile(filePath, text);
};
