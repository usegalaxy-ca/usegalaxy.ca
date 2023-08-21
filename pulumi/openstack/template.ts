import * as pulumi from '@pulumi/pulumi';

const TemplateProvider: pulumi.dynamic.ResourceProvider = {
  async create(inputs: object) {
    return {
      id: 'some-id',
      outs: inputs,
    };
  },
};

export class Template extends pulumi.dynamic.Resource {
  constructor(name: string, args: object, opts?: pulumi.CustomResourceOptions) {
    super(TemplateProvider, name, args, opts);
  }
}
