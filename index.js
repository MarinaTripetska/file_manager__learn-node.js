import fs from "fs/promises";
import os from "os";
import crypto from "crypto";
import zlib from "zlib";
import readline from "readline";
import path from "path";

//creating readline interface:
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "> ",
});

//read args from CLI and welcoming user:
const args = process.argv.slice(2);
const username =
  args.find((arg) => arg.startsWith("--username="))?.split("=")[1] ||
  "Anonymous";
console.log(`Welcome to the File Manager, ${username}!\n`);
console.log(`You are currently in ${process.cwd()}\n`);
rl.prompt();

//process input events listener:
rl.on("line", async (input) => {
  if (input.trim() === "up") {
    try {
      const cPath = process.cwd();
      const pPath = path.resolve(cPath, "..");
      if (cPath !== pPath) {
        process.chdir("..");
      } else {
        console.log("You are already at the root directory.\n");
      }
    } catch (error) {
      console.error("Operation failed\n");
    }
  } else if (input.startsWith("cd ")) {
    const pathToDir = input.split("cd ")[1].trim();
    try {
      await fs.access(pathToDir);
      process.chdir(pathToDir);
    } catch (error) {
      console.log("Operation failed\n");
    }
  } else if (input.startsWith("ls")) {
    try {
      const files = [];
      const directories = [];
      const items = await fs.readdir(process.cwd());
      await Promise.all(
        items.map(async (item) => {
          const fullPath = path.join(process.cwd(), item);
          const stats = await fs.stat(fullPath);

          if (stats.isDirectory()) {
            directories.push({ Name: item, Type: "directory" });
          } else if (stats.isFile()) {
            files.push({ Name: item, Type: "file" });
          }
        })
      );

      directories.sort((a, b) => a.Name.localeCompare(b.Name));
      files.sort((a, b) => a.Name.localeCompare(b.Name));

      console.table([...directories, ...files]);
    } catch (error) {
      console.log("Operation failed\n");
    }
  } else if (input.trim() === ".exit") {
    finishProcess();
  } else {
    console.error("Invalid input\n");
  }

  console.log(`You are currently in ${process.cwd()}\n`);
  rl.prompt();
}).on("close", () => {
  finishProcess();
});

function finishProcess() {
  console.log(`Thank you for using File Manager, ${username}, goodbye!\n`);
  console.log(`You are currently in ${process.cwd()}\n`);
  process.exit();
}
