import fsPromises from "fs/promises";
import fs from "fs";
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
      await fsPromises.access(pathToDir);
      process.chdir(pathToDir);
    } catch (error) {
      console.log("Operation failed\n");
    }
  } else if (input.startsWith("ls")) {
    try {
      const files = [];
      const directories = [];
      const items = await fsPromises.readdir(process.cwd());
      await Promise.all(
        items.map(async (item) => {
          const fullPath = path.join(process.cwd(), item);
          const stats = await fsPromises.stat(fullPath);

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
  } else if (input.startsWith("cat ")) {
    const filePath = input.split("cat ")[1].trim();
    try {
      await fsPromises.access(filePath);

      const fileName = path.basename(filePath);

      const readStream = fs.createReadStream(fileName);

      readStream.on("data", (chunk) => {
        process.stdout.write(chunk);
      });

      readStream.on("error", (err) => {
        console.error("Operation failed\n");
      });

      readStream.on("close", () => {
        rl.prompt();
      });
    } catch (error) {
      console.log("Operation failed\n");
    }
  } else if (input.startsWith("add ")) {
    const fileName = input.split("add ")[1].trim();

    try {
      await fsPromises.writeFile(fileName, "");
      console.log(`${fileName} has been created successfully\n`);
    } catch (error) {
      console.error("Operation failed\n");
    }
  } else if (input.startsWith("rn ")) {
    const [oldPath, newPath] = input.split("rn ")[1].trim().split(" ");

    try {
      await fsPromises.rename(oldPath, newPath);
      console.log(`${oldPath} has been renamed to ${newPath}\n`);
    } catch (error) {
      console.error("Operation failed\n");
    }
  } else if (input.startsWith("cp ")) {
    const [pathToFile, pathToNewDir] = input.split("cp ")[1].trim().split(" ");

    try {
      await fsPromises.access(pathToFile);
      await fsPromises.access(pathToNewDir);

      const fileName = path.basename(pathToFile);
      const newPath = path.join(pathToNewDir, fileName);

      const readStream = fs.createReadStream(fileName);
      const writeStream = fs.createWriteStream(newPath);

      readStream.pipe(writeStream);

      readStream.on("error", (err) => {
        console.error("Operation failed\n");
      });
      writeStream.on("error", (err) => {
        console.error("Operation failed\n");
      });

      writeStream.on("finish", () => {
        console.log(`File has been copied to ${newPath}\n`);
        rl.prompt();
      });
    } catch (error) {
      console.log("Operation failed\n");
    }
  } else if (input.startsWith("mv ")) {
    const [pathToFile, pathToNewDir] = input.split("mv ")[1].trim().split(" ");

    try {
      await fsPromises.access(pathToFile);
      await fsPromises.access(pathToNewDir);

      const fileName = path.basename(pathToFile);
      const newPath = path.join(pathToNewDir, fileName);

      const readStream = fs.createReadStream(fileName);
      const writeStream = fs.createWriteStream(newPath);

      readStream.pipe(writeStream);

      readStream.on("error", (err) => {
        console.error("Operation failed\n");
      });
      writeStream.on("error", (err) => {
        console.error("Operation failed\n");
      });

      writeStream.on("finish", async () => {
        try {
          await fsPromises.unlink(pathToFile);
          console.log(`File has been moved to ${newPath}\n`);
        } catch (error) {
          console.error("Failed to delete original file\n");
        } finally {
          rl.prompt();
        }
      });
    } catch (error) {
      console.log("Operation failed\n");
    }
  } else if (input.startsWith("rm ")) {
    const fileName = input.split("rm ")[1].trim();

    try {
      await fsPromises.unlink(fileName);
    } catch (error) {
      console.log("Operation failed\n");
    }
  } else if (input.startsWith("compress ")) {
    const [filePath, destDir] = input.split("compress ")[1].trim().split(" ");

    try {
      await fsPromises.access(filePath);
      await fsPromises.access(destDir);

      const fileName = path.basename(filePath, path.extname(filePath)) + ".br";
      const destPath = path.join(destDir, fileName);

      const readStream = fs.createReadStream(filePath);
      const compressStream = zlib.createBrotliCompress();
      const writeStream = fs.createWriteStream(destPath);

      readStream
        .pipe(compressStream)
        .pipe(writeStream)
        .on("error", (err) => {
          console.error("Operation failed\n");
        })
        .on("finish", () => {
          console.log(`File has been compressed and saved to ${destPath}\n`);
          rl.prompt();
        });
    } catch (error) {
      console.log("Operation failed\n");
    }
  } else if (input.startsWith("decompress ")) {
    const [filePath, destDir] = input.split("decompress ")[1].trim().split(" ");

    try {
      await fsPromises.access(filePath);
      await fsPromises.access(destDir);

      const fileName = path.basename(filePath, path.extname(filePath));
      const destPath = path.join(destDir, fileName);

      const readStream = fs.createReadStream(filePath);
      const decompressStream = zlib.createBrotliDecompress();
      const writeStream = fs.createWriteStream(destPath);

      readStream
        .pipe(decompressStream)
        .pipe(writeStream)
        .on("error", (err) => {
          console.error("Operation failed\n");
        })
        .on("finish", () => {
          console.log(`File has been decompressed and saved to ${destPath}\n`);
          rl.prompt();
        });
    } catch (error) {
      console.error("Operation failed\n");
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
