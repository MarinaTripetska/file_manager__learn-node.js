import path from "path";

export default function navUp() {
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
}
