#! /usr/bin/env node

const shell = require('shelljs');
const cv = require('compare-version');
const fs = require('fs');
const path = require('path');

const projectDir = process.cwd();
const pjson = require(path.join(projectDir, 'package.json'));
//console.log("--- Current package.json on git");
//const oldPjson = JSON.parse(shell.exec("git show HEAD~1:package.json").stdout);
const lastPublishedVersion = shell.exec("npm show " + pjson.name + " version").stdout.trim();
const versionBump = cv(lastPublishedVersion, pjson.version) >= 0;

const bump = () => {
  console.log("--- Latest published version: ", lastPublishedVersion);
  //console.log("--- Previous package.json version: ", oldPjson.version);
  console.log("--- Current package.json version: ", pjson.version);
  console.log("--- Need to bump version:", versionBump);

  if (versionBump) {
    console.log("--- Performing version bump based on latest published version...");
    pjson.version = lastPublishedVersion;
    fs.writeFileSync(path.join(projectDir, 'package.json'), JSON.stringify(pjson, null, 2));
    const newVersion = shell.exec("npm version --no-git-tag-version patch");
    shell.exec("git add package.json");
    shell.exec("git config --global user.name travis");
    shell.exec("git config --global user.email travis@example.com");
    shell.exec("git commit -m ${newVersion}");
    // need rebuild elsewhere after version bump so that the published vizabi is self-aware of its version
  }
};


bump();