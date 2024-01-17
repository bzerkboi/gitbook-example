const {glob} = require("glob");
var fsPromises = require("fs/promises");
var path = require("path");
const { spawn } = require("child_process");

console.debug("testing my logging")

// read environmental variables 
const ghActor = process.env["GITHUB_ACTOR"];
const isGitHubActions = Boolean(process.env["GITHUB_ACTIONS"]);

const GITBOOK_ACTOR = "gitbook-bot";
console.debug(`GitHub actions ${isGitHubActions}`);
console.debug(`GitHub actor ${ghActor}`);

//if (isGitHubActions) {
  // If we're in GitHub Actions, only run this for pushes from GitBook
//  if (ghActor !== GITBOOK_ACTOR) {
//    process.exit(0);
//  }
//}

// Load the footer from the footer.md file
const footer = require("fs").readFileSync(path.join(__dirname, "./footer.md"));
console.debug("Footer "+footer)
// find each markdown document in the docs directory
console.debug("Start looking for files ...");
console.debug(__dirname);
glob(path.join(__dirname, "../docs/**/*.md"), async (error, fileNames) => {
  console.debug(fileNames);
  // for each document
  const editPromises = fileNames.map(async (fileName) => {
    console.debug("file name found ="+ fileName);
    // load the contents of the document
    const fileContents = await (await fsPromises.readFile(fileName)).toString();
    // if the document doesn't end with the footer text
    if (!fileContents.endsWith(footer)) {
      // add the footer text to the end of the document
      const newFileContents = fileContents + footer;
      await fsPromises.writeFile(fileName, newFileContents);
    }
  });


  await Promise.all(editPromises);

  spawn("git", ["add", "."]);
});
console.debug("Done looking for files ...");