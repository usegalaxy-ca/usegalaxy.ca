import handlebars from "handlebars";
import fs from "fs";
import { Env } from "./env";

export class CloudInit {
  handlebarsTemplate: handlebars.TemplateDelegate;
  data: CloudInitData;

  constructor(template: CloudInitTemplate) {
    const cloudInitTemplate = readTemplate(template);
    this.handlebarsTemplate = handlebars.compile(cloudInitTemplate);
    this.data = {
      username: Env.USER_NAME,
      public_key: Env.PUBLIC_KEY,
    };
  }

  template() {
    return this.handlebarsTemplate(this.data);
  }
}

function readTemplate(template: CloudInitTemplate) {
  return fs.readFileSync(CLOUD_INIT_TEMPLATE[template], "utf-8");
}

const CLOUD_INIT_TEMPLATE = {
  node: "./cloudinit/node.yml",
  gateway: "./cloudinit/gateway.yml",
} as const;

export type CloudInitTemplate = keyof typeof CLOUD_INIT_TEMPLATE;

type CloudInitData = {
  username: string;
  public_key: string;
};
