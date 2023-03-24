import { require } from "./index.js";
import { __filename, __dirname } from "./dir.js";
import { utils, data } from "../index.js";
import utils_d from "./utils_d.js";

const readline = require("readline");

const { cls, commands, procesCmd } = data;
//Show all files list

const mainScreen = (filesInfo) => {

  console.log("show_d")

  console.log(filesInfo)

  // const scanner = readline.createInterface({
  //   input: process.stdin,
  //   output: process.stdout,
  // });
  //
  // const currentScreen = () => {
  //   cls();
  //   utils_d.showFiles(filesInfo.value);
  //   console.log(
  //     "\nCommmands =>\ne/exit: To exit\nr/reprint: To reprint current screen\n\n" +
  //       "Enter Command:"
  //   );
  // };
  //
  // utils.dataCheck(filesInfo, currentScreen, "No files available");
  //
  // scanner.on("line", (input) => {
  //   if (commands.includes(input)) {
  //     procesCmd(input, scanner, currentScreen);
  //   } else {
  //     console.log("Wrong Input\n");
  //   }
  // });
};

const exportData = {};
exportData.mainScreen = mainScreen;
export default exportData;
