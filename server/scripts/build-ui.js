const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

const serverDir = path.resolve(__dirname, "..");
const projectDir = path.resolve(serverDir, "..");

const serverDist = path.join(serverDir, "dist");
const frontendDist = path.join(projectDir, "dist");



// Remove previous build
fs.rmSync(serverDist, {
    recursive: true,
    force: true
});

// Install frontend dependencies
execSync("npm ci --include=dev", {
    cwd: projectDir,
    stdio: "inherit"
});

// Build frontend
execSync("npm run build", {
    cwd: projectDir,
    stdio: "inherit"
});

// Copy build files
fs.cpSync(frontendDist, serverDist, {
    recursive: true
});

console.log("Frontend build completed successfully");