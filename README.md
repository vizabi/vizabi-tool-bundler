# vizabi-tool-bundler

Shared build and CI scripts for vizabi tools

# Contains
Shared rollup build script  
Shared Travis YML config  
Shared version bump script  

# How it works
When you run `npm run build` in your tool's repo folder it starts the automatic build with rollup. The rollup config is taken from this tool bundler. The shared rollup script also copies travis.yml into the repo which will later be used in CI. That way travis config is shared too from a single source. 

## 🔢 Version bump
If version in package.json is the same or lower as latest published version on npm, then increase version to a next pre-release. 🌶 Note that prerelease version order is weird: 0.0.1, 0.0.2-1, 0.0.2-2, 0.0.2, 0.0.3-1 ...

## 👾 S3 deploy
Copies output files from /build to 2 locations: static.gapminderdev.org/<your_tool_name> (latest build) and in static.gapminderdev.org/<your_tool_name>/<version>. Versioned builds would be used in other tools and projects.

## 📦 npm deploy
Publishes the built version (possibly bumped with a pre-release suffix) to npm

## 🙈 Gapminder tools page deploy
Logs into tools-dev instance on Digital Ocean over ssh and runs [this script](https://github.com/Gapminder/tools-page/blob/development/build.dev.sh). Tools page DEV (and only dev) fetches the latest published tools from npm, thus the fresh build would also feature your latest updates.

# How to set up
Best to follow example of how it's done in one of the existing tools. For example, [line chart](https://github.com/vizabi/vizabi-linechart/tree/master)

1. Create your vizabi tool, add dev dependencies `"vizabi-tool-bundler": "github:vizabi/vizabi-tool-bundler"` and `"cross-env": "^5.0.0"` in package.json

2. Add files rollup.config.js and rollup.external.js (don't forget to specify the name of the tool in the latter, [like so](https://github.com/vizabi/vizabi-linechart/blob/master/rollup.external.js))

3. Add scripts: `"start": "rollup -c"` and `"build": "cross-env NODE_ENV=production rollup -c"` in package.json

4. Now you should be able to run `npm install` and `npm run build` in your tool folder locally

5. Set up github webhook to trigger Travis build on push event

6. Enable the tool repo in Travis CI interface

7. Configure travis environment variables in repo settings:

* AWS_ACCESS_KEY_ID = check in AWS admin web interface, under cridentials of Travis user, looks something like `AKIA************YEWP`
* AWS_BUCKET = static.gapminderdev.org
* AWS_SUBFOLDER = your tool name such as `vizabi-linechart`
* encrypted_6f3bd6d63370_iv = these two are the private and public keys for accessing tools page over SSH
* encrypted_6f3bd6d63370_key = you can read more in [this article](https://oncletom.io/2016/travis-ssh-deploy/)
* TOOLSPAGE_HOST = IP or DNS name of tools page server 
* TOOLSPAGE_USER = username to log in over ssh

8. Note that S3 secret ID and NPM auth key are not listed above, instead they are encrypted and pasted directly in .travis.yml

9. Disable `build config validation` in the bottom of the page (repo settings on travis)

10. Push your tool to github repo and watch the build on travis.

# How to use
## 1. Use case: make changes in a tool, publish to S3, NPM, tools-dev:
* Change the tool code, check your changes in [preview page](https://github.com/vizabi/vizabi-preview)
* Build the tool locally using `npm run build`, take care of any errors and warnings
* Push your changes to `master` branch of the tool, the build should propagate as needed

## 2. Use case: try out some changes in a tool but don't push to S3, NPM or Tools-dev:
* Same as 1 but push your changes to a feature branch instead of master

## 3. Use case: release a new version of the tool
* When you are happy with the changes you want to release
* Check the latest published version on NPM using `npm view <your_tool_name> version`
* Update manually version number in package.json: if it's a major (X.x.x) or minor (x.X.x) version, set the new version code as you like, the version should be ahead of the lates published one. If it's a patch (x.x.X), look if there was a pre-release in the latest published. If there was, use _that_ release (example: x.x.2-1 is latest published, use x.x.2), otherwise use next release (example: x.x.2 is the latest published, use x.x.3)
* Commit, build, push changes to `master`
