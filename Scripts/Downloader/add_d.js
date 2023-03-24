import { require } from "./index.js";
import { __filename, __dirname } from "./dir.js";

const mainScreen = () => {
  console.log("hello");
};

const exportData = {};
exportData.mainScreen = mainScreen;
export default exportData;
