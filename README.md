# vizabi-tool-bundler

Shared build and CI scripts for vizabi tools

# Contains
Shared rollup build script
Shared Travis YML config
Shared version bump script

# How it works
When you run `npm run build` in your tool's repo folder it starts the automatic build with rollup. The rollup config is taken from this tool bundler. The shared rollup script also copies travis.yml into the repo which will later be used in CI. That way travis config is shared too from a single source. 

## Version bumps
If version in package.json is the same or lower as latest published version on npm, then up version to a next pre-release. Noe that prerelease version order is weird: 0.0.1, 0.0.2-1, 0.0.2-2, 0.0.2 ...

## s3 deploy
Copies output files from /build to 2 locations in in static.gapminderdev.org/<your_tool_name>: into the root of that folder (latest build) and into a versioned subfolder.

## npm deploy
Deploys the built version (possibly bumped) to npm

## tools page deploy
Logs into tools-dev page over ssh and runs a script. Tools page DEV (and only dev) fetches the latest published tools from npm, thus the new build would also feature your latest updates.

# How to set up
Best to follow example of how it's done in one of the existing tools. For example, line chart

1. Create your vizabi tool, add dev dependencies "vizabi-tool-bundler": "github:vizabi/vizabi-tool-bundler" and "cross-env": "^5.0.0"

2. Add rollup.config.js and rollup.external.js (don't forget to specify the name of the tool in the latter)

3. Add scripts: "start": "rollup -c" and "build": "cross-env NODE_ENV=production rollup -c",

4. Now you should be able to run "npm install" and "npm run build" in your tool folder

5. Set up github webhook to trigger Travis build on push

6. Enable the tool repo in Travis CI interface

7. Add travis environment variables in repo settings:

* AWS_ACCESS_KEY_ID = check in AWS admin web interface, under cridentials of Travis user, looks something like `AKIA************YEWP`
* AWS_BUCKET = static.gapminderdev.org
* AWS_SUBFOLDER = your tool name such as `vizabi-linechart`
* encrypted_6f3bd6d63370_iv = these two are the private and public keys for accessing tools page over SSH
* encrypted_6f3bd6d63370_key 
* TOOLSPAGE_HOST = IP or DNS name of tools page server 
* TOOLSPAGE_USER = username to log in over ssh

8. note that S3 secret ID and NPM auth key are not listed here, instead they are encrypted and pasted directly in .travis.yml

9. disable build config validation in the bottom of the page (repo settings on travis)

10. Push something to the repo and watch the build on travis.

# How to use
1. Use case: make changes in a tool, publish to S3, NPM, tools-dev:
* Change the tool code, check your changes in preview page
* Build the tool locally using `npm run build`, take care of any errors and warnings
* Push your changes to master branch of the tool, the build will propagate as needed

2. Use case: try out some change in a tool but don't push to S3, NPM, tools-dev:
* Same as 1 but push your changes to a feature branch and not a master

3. Use case: release a version of the tool
* Check the latest published version on NPM using `npm view <your-tool-name> version`
* Update manually the version number in package.json: if it's a major or minor version, set the new version code. If it's a patch, look if there was a pre-release in the latest published.
* Commit, build, push changes to master
