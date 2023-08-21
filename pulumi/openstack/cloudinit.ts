import { templateFile } from './utils';
import { Env } from './env';

export class CloudInit {
  templatePath: string;
  data: CloudInitData;

  constructor(template: CloudInitTemplate) {
    this.templatePath = CLOUD_INIT_TEMPLATE[template];
    this.data = {
      username: Env.USERNAME,
      public_key: Env.PUBLIC_KEY,
    };
  }

  template() {
    return templateFile(this.templatePath, this.data);
  }
}

const CLOUD_INIT_TEMPLATE = {
  node: './cloudinit/node.yml',
  gateway: './cloudinit/gateway.yml',
} as const;

export type CloudInitTemplate = keyof typeof CLOUD_INIT_TEMPLATE;

type CloudInitData = {
  username: string;
  public_key: string;
};
