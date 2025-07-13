const fs = require("fs");
const archiver = require("archiver");
const path = require("path");

// Read version from manifest.json
const manifest = JSON.parse(fs.readFileSync("manifest.json", "utf8"));
const version = manifest.version || "v1.0.0";

// Create release folder
const releaseDir = "release";
if (!fs.existsSync(releaseDir)) {
  fs.mkdirSync(releaseDir);
}

// Files to copy
const filesToCopy = ["main.js", "manifest.json"];
if (fs.existsSync("styles.css")) {
  filesToCopy.push("styles.css");
}

// Copy files synchronously
filesToCopy.forEach(file => {
  const dest = path.join(releaseDir, path.basename(file));
  fs.copyFileSync(file, dest);
  console.log(`✅ Copied: ${file} → ${dest}`);
});

// Now create zip (after copy finishes)
const zipName = `cross-os-name-guard-${version}.zip`;
const output = fs.createWriteStream(`${releaseDir}/${zipName}`);
const archive = archiver("zip", { zlib: { level: 9 } });

output.on("close", () => {
  console.log(`🎉 Release zip created: ${releaseDir}/${zipName} (${archive.pointer()} bytes)`);
});

archive.on("error", err => { throw err; });

archive.pipe(output);

// Add copied files to zip
filesToCopy.forEach(file => {
  const filePath = path.join(releaseDir, path.basename(file));
  archive.file(filePath, { name: path.basename(file) });
});

archive.finalize();
