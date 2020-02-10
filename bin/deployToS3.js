#! /usr/bin/env node

const shell = require('shelljs');
const cv = require('compare-version');
const fs = require('fs');
const path = require('path');
const rmrf = require('rimraf');

const {
  AWS_BUCKET,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_KEY,
  AWS_SUBFOLDER
} = process.env;

const projectDir = process.cwd();
const pjson = require(path.join(projectDir, 'package.json'));
const version = pjson.version

const upload = (path) => {
  shell.exec(
    `s3cmd -v --config=/tmp/.${AWS_BUCKET}-s3.s3cfg` +
    ` --acl-public` +
    ` --recursive` +
    ` --no-mime-magic` +
    ` --guess-mime-type` +
    ` sync build/ "${path}"`
  );
};

const deployToS3 = () => {
  const FLAGFILE = "/tmp/deployment.flag";
  fs.writeFileSync(FLAGFILE);
  
  shell.ShellString([
    '[default]',
    `access_key = ${AWS_ACCESS_KEY_ID}`,
    `secret_key = ${AWS_SECRET_KEY}`,
    `acl_public = True`
  ].join('\n')).to(`/tmp/.${AWS_BUCKET}-s3.s3cfg`);

  upload(`s3://${AWS_BUCKET}/${AWS_SUBFOLDER}/${version}/`);
  upload(`s3://${AWS_BUCKET}/${AWS_SUBFOLDER}/latest/`);
  
  rmrf.sync('/.tmp');
};

deployToS3();
