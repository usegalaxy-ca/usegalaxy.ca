import { Env } from './env';
import handlebars from 'handlebars';
import fs from 'fs';

export function getResourceName(name: string) {
  return `${Env.INSTANCE_NAME_PREFIX}-${Env.PROJECT_NAME}-${name}`;
}

export function templateFile(templatePath: string, data: object) {
  const template = readFile(templatePath);
  const handlebarsTemplate = handlebars.compile(template);
  return handlebarsTemplate(data);
}

export function readFile(path: string) {
  return fs.readFileSync(path, 'utf-8');
}
