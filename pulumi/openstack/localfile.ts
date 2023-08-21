/*
 * This file contains the LocalFile custom resource.
 * It is used to create a local file on the filesystem.
 * Based on the terraform local_file resource.
 *
 * Usage:
 * new LocalFile("my-file", {
 *  content: "some content",
 *  filename: "/tmp/my-file",
 *  file_permission: "0644",
 * })
 */

import * as pulumi from '@pulumi/pulumi';
import fs from 'fs';
import path from 'path';

export interface LocalFileArgs {
  content: pulumi.Input<string>;
  filename: pulumi.Input<string>;
  filePermission: pulumi.Input<string>;
}

interface LocalProviderArgs {
  content: string;
  filename: string;
  filePermission: string;
}

const localProvider: pulumi.dynamic.ResourceProvider = {
  async check(_olds: LocalProviderArgs, news: LocalProviderArgs) {
    verifyInputs(news);
    return { inputs: news };
  },

  async create(
    inputs: LocalProviderArgs
  ): Promise<pulumi.dynamic.CreateResult> {
    fs.writeFileSync(inputs.filename, inputs.content, {
      mode: inputs.filePermission,
    });
    return { id: inputs.filename, outs: {} };
  },

  async diff(_id: string, olds: LocalProviderArgs, news: LocalProviderArgs) {
    const replaces = [];
    if (olds.content !== news.content) {
      replaces.push('content');
    }
    if (olds.filePermission !== news.filePermission) {
      replaces.push('file_permission');
    }
    return { changes: replaces.length > 0, replaces };
  },

  async update(_id: string, _olds: LocalProviderArgs, news: LocalProviderArgs) {
    fs.writeFileSync(news.filename, news.content, {
      mode: news.filePermission,
    });
    return { outs: {} };
  },

  async delete(_id: string, props: LocalProviderArgs) {
    fs.unlinkSync(props.filename);
  },
};

function verifyInputs(news: LocalProviderArgs) {
  const destDir = path.dirname(news.filename);
  if (!dirExists(destDir)) {
    throw new Error(`destination directory ${destDir} does not exist`);
  }
  if (!isValidPermission(news.filePermission)) {
    throw new Error(
      `file_permission ${news.filePermission} is not valid, must be 3 digits between 0 and 7`
    );
  }
}

function dirExists(path: string): boolean {
  return fs.statSync(path).isDirectory();
}

function isValidPermission(permission: string): boolean {
  return permission.match(/^[0-7]{3}$/) !== null;
}

export class LocalFile extends pulumi.dynamic.Resource {
  constructor(
    name: string,
    props: LocalFileArgs,
    opts?: pulumi.CustomResourceOptions
  ) {
    super(localProvider, name, props, opts);
  }
}
