import { require } from "./index.js";
import { __filename, __dirname } from "./dir.js";
import clipboardy from "clipboardy";
import data from "./data.js";

const readline = require("readline");
const child_process = require("child_process");
const { cls, commands, procesCmd, writeFile, readFileLines } = data;

//Removes certain indexes from Array (works with array with distinct data (no repetation))

const removeData = (arr, dataSet) => {
  return arr.filter((data, i) => !dataSet.has(data));
};

//Removes certain indexes from Array (works with any array)

const removeIndexes = (arr, indexes, doRev) => {
  let indexSet;

  if (Array.isArray(indexes)) {
    indexSet = new Set();

    if (doRev) {
      indexes.forEach((i) => {
        indexSet.add(arr.length - (i + 1));
      });
    } else {
      indexes.forEach((i) => {
        indexSet.add(i);
      });
    }
  } else {
    indexSet = indexes;
  }

  return arr.filter((data, i) => !indexSet.has(i));
};

//Filters a set based on a criteria

const filterSet = (set, filterFunction) => {
  let it = set.values(); //Iterator object

  let value = it.next().value;

  while (value) {
    if (!filterFunction(value)) set.delete(value);
    value = it.next().value;
  }

  return set;
};

//used to write download Scripts

const writeResult = (fdata) => {
  const [results, namePattern, makeContent, doMultiple] = fdata;

  const path = data.out_path;

  results.forEach((result) => {
    console.log(result);
  });
  console.log(results.length);

  let content = "";

  const writeMultiple = () => {
    let i = Math.floor(results.length / 3); //No. of lines each file

    if (i === 0) i = 1;
    //For avioding divide by zero
    else if (results.length % 3 === 2) i += 1; //For even load distribution among files

    let j = 0; //Used for no. of files (3,So 0<=j<=2)

    results.forEach((result, index) => {
      if (Math.floor(index / i) > j && j <= 1) {
        writeFile(path + namePattern + (j + 1).toString() + ".sh", content);
        j += 1;
        content = "";
      }
      content += makeContent(result);
    });

    writeFile(path + namePattern + (j + 1).toString() + ".sh", content);
  };

  const writeSingle = () => {
    results.forEach((result, index) => {
      content += makeContent(result);
    });

    writeFile(path + namePattern + "1.sh", content);
  };

  if (doMultiple) writeMultiple();
  else writeSingle();
};

//Prints names with indexes for a array

const printNames = (fdata) => {
  fdata.forEach((dt, index) => {
    console.log(index + 1, dt.name, "\n");
  });
};

//Fetches indexes from range input

const fetchIndexes = (input) => {
  let indexes = [];
  const inputSlabs = input.split(" ");

  //Making a indexes arrray from string inputs
  for (let i = 0; i < inputSlabs.length; i += 1) {
    //For range inputs i.e 24-29 , 90-80 etc
    if (inputSlabs[i] && inputSlabs[i].includes("-")) {
      const range = inputSlabs[i].split("-");
      if (range.length === 2 && !isNaN(range[0]) && !isNaN(range[1])) {
        const left = parseInt(range[0]),
          right = parseInt(range[1]);
        if (
          Number.isInteger(left) &&
          Number.isInteger(right) &&
          left > 0 &&
          right > 0
        ) {
          if (left < right) {
            for (let j = left - 1; j < right; j += 1) indexes.push(j);
          } else {
            for (let j = left - 1; j >= right - 1; j -= 1) indexes.push(j);
          }
        } else return false;
      } else return false;
    }
    //For single Inputs
    else if (inputSlabs[i] && !isNaN(inputSlabs[i])) {
      const num = parseInt(inputSlabs[i]);
      if (Number.isInteger(num) && num > 0) indexes.push(num - 1);
      else return false;
    } else return false;
  }

  indexes = new Set(indexes);
  indexes = Array.from(indexes);

  return indexes;
};

//Validates range input

const checkRangeInput = (input, requiredLength) => {
  const indexes = fetchIndexes(input);

  if (indexes) {
    for (let i = 0; i < indexes.length; i += 1)
      if (indexes[i] >= requiredLength) return false;
    if (indexes.length > 0) return true;
    else return false;
  } else return false;
};

//Shows a selection screen for selection (returns an array of selected indexes)

const selectSome = (dataObject, showingFunction, msg) => {
  const scanner = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const m1 =
    "\nCommmands =>\ne/exit: To exit\nr/reprint: To reprint current screen\n\n";

  const message = m1 + msg;

  const currentScreen = () => {
    cls();
    showingFunction(dataObject);
    console.log(message);
  };

  currentScreen();

  return new Promise((resolve, reject) => {
    scanner.on("line", (input) => {
      if (checkRangeInput(input, dataObject.length)) {
        const indexes = fetchIndexes(input);
        scanner.close();
        cls();
        resolve(indexes);
      } else if (commands.includes(input)) {
        procesCmd(input, scanner, currentScreen);
      } else {
        console.log("Wrong Input\n");
      }
    });
  });
};

//Shows a confomatio screen before doing critical operations f:function

const confromationScreen = (msg, fdata, func) => {
  const scanner = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const currentScreen = () => {
    cls();
    console.log(msg);
    if (!func) printNames(fdata);
    else func(fdata);
    console.log(
      "\nCommmands =>\ne/exit: To exit\nr/reprint: To reprint current screen\n"
    );
    console.log("Are you Sure ? (y/n): ");
  };

  currentScreen();

  return new Promise((resolve, reject) => {
    scanner.on("line", (input) => {
      if (input === "y" || input === "n") {
        if (input === "y") {
          cls();
          scanner.close();
          resolve(true);
        } else {
          cls();
          scanner.close();
          resolve(false);
        }
      } else if (commands.includes(input)) {
        procesCmd(input, scanner, currentScreen);
      } else {
        console.log("Wrong Input\n");
      }
    });
  });
};

//Check if data is available for operation

const dataCheck = (fdata, msg) => {
  if (!fdata || fdata.length === 0) {
    cls();
    console.log(msg);
    process.exit();
  }
};

//Waits for user for pressing a key

const waitKeyStroke = () => {
  const scanner = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("Press enter to continue....");

  return new Promise((resolve, reejct) => {
    scanner.on("line", (inp) => {
      resolve(inp);
      scanner.close();
    });
  });
};

//Passes simpy the keywords array in lower case from input string

const passKeywords = (msg, acceptBlank) => {
  const scanner = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const currentScreen = () => {
    cls();
    console.log(
      "\nCommmands =>\ne/exit: To exit\nr/reprint: To reprint current screen\n"
    );
    console.log(msg);
  };

  const checkinput = (input) => {
    if (acceptBlank && input === "") return true;
    let inputs = input.split(" ");
    if (inputs.includes("")) return false;
    else return true;
  };

  currentScreen();

  return new Promise((resolve, reject) => {
    scanner.on("line", (input) => {
      if (commands.includes(input)) {
        procesCmd(input, scanner, currentScreen);
      } else if (checkinput(input)) {
        cls();
        scanner.close();
        if (acceptBlank && input === "") resolve([]);
        const inputs = input.split(" ");
        inputs.forEach((inp, i) => {
          inputs[i] = inp.toLocaleLowerCase();
        });
        resolve(inputs);
      } else {
        console.log("Wrong Input\n");
      }
    });
  });
};

//Passes simpy the inputs

const passInputs = (msg, acceptBlank) => {
  const scanner = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const currentScreen = () => {
    cls();
    console.log(
      "\nCommmands =>\ne/exit: To exit\nr/reprint: To reprint current screen\n"
    );
    console.log(msg);
  };

  const checkinput = (input) => {
    if (acceptBlank && input === "") return true;
    if (input === "") return false;
    else return true;
  };

  currentScreen();

  return new Promise((resolve, reject) => {
    scanner.on("line", (input) => {
      if (commands.includes(input)) {
        procesCmd(input, scanner, currentScreen);
      } else if (checkinput(input)) {
        cls();
        scanner.close();
        resolve(input);
      } else {
        console.log("Wrong Input\n");
      }
    });
  });
};

//Checks for certain file formts from a given file name

const checkFormats = (name, formats) => {
  if (!formats || formats.length === 0) formats = data.formats;

  for (let i = 0; i < formats.length; i += 1) {
    if (name.toLowerCase().endsWith("." + formats[i])) return true;
  }
  return false;
};

//Excludes certain keywords from a name

const excludeKeywords = (name, irreleventKeywords) => {
  if (!irreleventKeywords || irreleventKeywords.length === 0)
    irreleventKeywords = data.irreleventKeywords;

  for (let i = 0; i < irreleventKeywords.length; i += 1) {
    if (name.toLowerCase().includes(irreleventKeywords[i])) return false;
  }
  return true;
};

//Search if a certain keywords present in a name

const searchKeywords = (name, givenKeywords) => {
  for (let i = 0; i < givenKeywords.length; i += 1) {
    if (name.toLowerCase().includes(givenKeywords[i])) return true;
  }
  return false;
};

//Takes and executes from main menu fuctions

const mainMenuExec = (features) => {
  const scanner = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const sections = features.getSectionsData();

  //section array contains functions theier recurring corresponding sectionsLength
  // and data required by functions

  //[0]=> functions to be executed [1]=> recurring length (total length of objects appearing before)
  //an object) [2]=>data requied by functions

  const tf = sections[1][sections[1].length - 1];

  //tf : Total no. of operations

  const currentScreen = () => {
    cls();
    console.log(features.inputScreen());
  };

  //Showing input Screen for first time
  currentScreen();

  scanner.on("line", (input) => {
    if (!isNaN(input) && parseInt(input) > 0 && parseInt(input) <= tf) {
      scanner.close();
      let index = parseInt(input) - 1;
      for (let i = 0; i < sections[0].length; i += 1) {
        if (index < sections[1][i]) {
          let j;
          if (i > 0) j = index - sections[1][i - 1];
          else j = index;
          if (sections[2][i]) sections[0][i][j].execFunction(sections[2][i]);
          else sections[0][i][j].execFunction();
          break;
        }
      }
    } else if (commands.includes(input)) {
      procesCmd(input, scanner, currentScreen);
    } else {
      console.log("Wrong Input\n");
    }
  });
};

//Executes functions with operations

const execOperations = (operations, processInput, func, banner) => {
  let screenInputs = "";

  operations.forEach((operation, i) => {
    screenInputs += (i + 1).toString() + ". " + operation.message + "\n";
  });

  screenInputs +=
    "\nCommmands =>\ne/exit: To exit\nr/reprint: To reprint current screen\n\n" +
    "Enter Inputs:";

  const scanner = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const checkInput = (input) => {
    if (input === "") return true;
    else if (checkRangeInput(input, operations.length)) {
      let indexes = fetchIndexes(input);
      indexes.forEach((index) => {
        operations[index].value = !operations[index].value;
      });
      return true;
    } else return false;
  };

  const currentScreen = () => {
    cls();
    if (banner) console.log(banner);
    console.log(screenInputs);
  };

  currentScreen();

  scanner.on("line", (input) => {
    if (checkInput(input)) {
      cls();
      scanner.close();
      if (func) processInput(operations, func);
      else processInput(operations);
    } else if (commands.includes(input)) {
      procesCmd(input, scanner, currentScreen);
    } else {
      console.log("Wrong Input\n");
    }
  });
};

//Execute a shell (OS Shell) commands

const cmdExec = (cmd) => {
  const exec = new Promise((resolve, reject) => {
    child_process.exec(cmd, (error, stdout, stderr) => {
      if (error) {
        cls();
        console.log(`error: ${error.message}`);
        process.exit();
      }
      if (stderr) {
        cls();
        console.log(`stderr: ${stderr}`);
        process.exit();
      }
      //console.log(`stdout: ${stdout}`);
      resolve(stdout);
    });
  });
  return exec;
};

//For monitoring clipboard

const monitorClipboard = async (filterFunction) => {
  let contents = new Set();
  let i = 0;
  const monitor = async () => {
    const data = await clipboardy.read();
    if (!contents.has(data) && (!filterFunction || filterFunction(data))) {
      contents.add(data);
      i += 1;
    }
    cls();
    console.log("Monitoring clipboard");
    console.log("Press Ctrl+C to exit\n");
    console.log(i, "records added to list.");
  };
  const mInterval = setInterval(monitor, 500);
  const scanner = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  cls();
  console.log("Monitoring clipboard");
  console.log("Press Ctrl+C to exit");

  return new Promise((resolve, reject) => {
    scanner.on("SIGINT", (inp) => {
      clearInterval(mInterval);
      scanner.close();
      resolve(Array.from(contents));
    });
  });
};

//For printing array in reverse

const printRevArr = (arr) => {
  let j = 1;
  for (let i = arr.length - 1; i >= 0; i -= 1) {
    console.log(j, arr[i], "\n");
    j += 1;
  }
};

//For printing array in reverse

const printFwdArr = (arr) => {
  for (let i = 0; i < arr.length; i += 1) {
    console.log(i + 1, arr[i], "\n");
  }
};

//For printing data structs in add(add_d,add_t) fuctions data

const printRevObj = (obj) => {
  let j = 1;
  let arr = obj.order;
  for (let i = arr.length - 1; i >= 0; i -= 1) {
    console.log(j, obj[arr[i]].name, "\n");
    j += 1;
  }
};

//For modifying data structs in add(add_d,add_t) fuctions data

const modifyObj = (obj) => {
  const mf = async (resolve) => {
    if (obj.order.length > 0) {
      const msg = "Select records to delete:";
      const indexes = await selectSome(obj, printRevObj, msg);
      const torder = []; //temp order
      let order = obj.order;

      let indexSet = new Set();
      const names = [];

      for (let i = indexes.length - 1; i >= 0; i -= 1) {
        const j = indexes[i];
        torder.push(order[order.length - (j + 1)]);
        indexSet.add(order.length - (j + 1));
        names.push(obj[order[order.length - (j + 1)]].name);
      }

      const conformation = await confromationScreen(
        "Selected records for deletion:\n",
        torder,
        () => {
          printRevObj({
            ...obj,
            order: torder,
          });
        }
      );
      if (conformation) {
        obj.order = removeIndexes(order, indexSet);
        torder.forEach((hash) => {
          delete obj[hash];
        });
        console.log("\t","Delete operation successful\n");
        console.log("\t",indexes.length, " records deleted successfully\n");
        printFwdArr(names);
      } else {
        console.log("Delete operation cancelled");
      }
    } else console.log("No records available");
    resolve(obj);
  };
  return new Promise((resolve, reject) => {
    mf(resolve);
  });
};

//For modifying data structs in add(add_d,add_t) fuctions data

const modifyArr = (arr) => {
  const mf = async (resolve) => {
    if (arr.length > 0) {
      const msg = "Select records to delete:";
      const indexes = await selectSome(arr, printRevArr, msg);
      const conformation = await confromationScreen(
        "Selected records for deletion:\n",
        arr,
        () => {
          indexes.forEach((i, j) => {
            console.log(j + 1, arr[arr.length - (i + 1)], "\n");
          });
        }
      );
      if (conformation) {
        const names = [];
        indexes.forEach((i, j) => {
          names.push(arr[arr.length - (i + 1)]);
        });
        arr = removeIndexes(arr, indexes, true);
        console.log("Delete operation successful\n");
        console.log(indexes.length, " records deleted successfully\n");
        printFwdArr(names);
      } else {
        console.log("Delete operation cancelled");
      }
    } else console.log("No records available");
    resolve(arr);
  };
  return new Promise((resolve, reject) => {
    mf(resolve);
  });
};

//For taking special Commands

const takeSpecialCommands = async () => {
  let cmdStr, cmd, cmdPath;
  const mf = async (resolve) => {
    cmdStr = await passInputs(
      "Message: Press Enter for reading from text file\n\n" +
        "Enter your commands:",
      true
    );
    if (cmdStr === "") cmdStr = readFileLines(__dirname + "/../command.txt")[0];

    cmd = cmdStr.split(" ")[0];
    cmdPath = cmdStr.substring(cmd.length);
    resolve([cmd, cmdPath]);
  };

  return new Promise((resolve, reject) => {
    mf(resolve);
  });
};

const exportData = {};

exportData.selectSome = selectSome;
exportData.fetchIndexes = fetchIndexes;
exportData.checkRangeInput = checkRangeInput;
exportData.confromationScreen = confromationScreen;
exportData.dataCheck = dataCheck;
exportData.waitKeyStroke = waitKeyStroke;
exportData.passKeywords = passKeywords;
exportData.passInputs = passInputs;
exportData.checkFormats = checkFormats;
exportData.excludeKeywords = excludeKeywords;
exportData.searchKeywords = searchKeywords;
exportData.mainMenuExec = mainMenuExec;
exportData.execOperations = execOperations;
exportData.cmdExec = cmdExec;
exportData.printNames = printNames;
exportData.writeResult = writeResult;
exportData.monitorClipboard = monitorClipboard;
exportData.printRevArr = printRevArr;
exportData.printFwdArr = printFwdArr;
exportData.printRevObj = printRevObj;
exportData.modifyObj = modifyObj;
exportData.modifyArr = modifyArr;
exportData.takeSpecialCommands = takeSpecialCommands;
exportData.filterSet = filterSet;
exportData.removeIndexes = removeIndexes;
exportData.removeData = removeData;

export default exportData;
