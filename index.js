import fs from "fs";
import os from "os";
import crypto from "crypto";
import zlib from "zlib";
import readline from "readline";

//creating readline interface:
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

//read args from CLI and welcoming user:
const args = process.argv.slice(2);
const username =
  args.find((arg) => arg.startsWith("--username="))?.split("=")[1] ||
  "Anonymous";
rl.write(`Welcome to the File Manager, ${username}!\n`);

rl.on("line", (input) => {
  if (input.trim() === ".exit") {
    rl.write(`\nThank you for using File Manager, ${username}, goodbye!\n`);
    process.exit();
  }
  // Handle other inputs...
});

rl.on("SIGINT", () => {
  rl.write(`\nThank you for using File Manager, ${username}, goodbye!\n`);
  process.exit();
});
