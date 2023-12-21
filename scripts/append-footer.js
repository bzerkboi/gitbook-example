var glob = require("glob");
var fsPromises = require("fs/promises");
var path = require("path");
const { spawn } = require("child_process");

// read environmental variables 
const ghActor = process.env["GITHUB_ACTOR"];
const isGitHubActions = Boolean(process.env["GITHUB_ACTIONS"]);

const GITBOOK_ACTOR = "gitbook-bot";
console.log(`GitHub actions ${isGitHubActions}`);
console.log(`GitHub actor ${ghActor}`);

if (isGitHubActions) {
  // If we're in GitHub Actions, only run this for pushes from GitBook
  if (ghActor !== GITBOOK_ACTOR) {
    process.exit(0);
  }
}

// Load the footer from the footer.md file
const footer = require("fs").readFileSync(path.join(__dirname, "./footer.md"));

// find each markdown document in the docs directory
console.log("Start looking for files ...")
glob(path.join(__dirname, "../docs/**/*.md"), async (error, fileNames) => {
  console.log(fileNames);
  // for each document
  const editPromises = fileNames.map(async (fileName) => {
    // load the contents of the document
    const fileContents = await (await fsPromises.readFile(fileName)).toString();
    // if the document doesn't end with the footer text
    if (!fileContents.endsWith(footer)) {
      // add the footer text to the end of the document
      const newFileContents = fileContents + footer;
      await fsPromises.writeFile(fileName, newFileContents);
    }
  });
  console.log("Done looking for files ...")

  await Promise.all(editPromises);

  spawn("git", ["add", "."]);
});