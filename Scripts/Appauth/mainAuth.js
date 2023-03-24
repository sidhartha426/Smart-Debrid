import { require } from "./index.js";
import { __filename, __dirname } from "./dir.js";
import { myrequest, data, utils } from "../index.js";

//Authorization Functions

import { appRegister, accessToken, refreshToken } from "./index.js";

const readline = require("readline");
const { cls, commands, procesCmd } = data;

const mainScreen = () => {
  const featuresData = {
    appauth: [
      { message: "Register App", execFunction: appRegister.makeRequest },
      { message: "Get AccessToken", execFunction: accessToken.makeRequest },
      {
        message: "Refresh AccessToken",
        execFunction: refreshToken.makeRequest,
      },
    ],
    getSectionsData: function () {
      let sections = [this.appauth];
      let sectionsLength = [];
      let sectionsData = [false];
      let t = 0;
      for (let i = 0; i < sections.length; i += 1) {
        t += sections[i].length;
        sectionsLength.push(t);
      }
      return [sections, sectionsLength, sectionsData];
    },
    sectionsBanner: ["App Authorization:"],
    inputScreen: function () {
      let str = "";

      str += "\t\tDebrid-Link API\n\n";

      let [sections, sectionsLength] = this.getSectionsData();

      for (let i = 0; i < sections.length; i += 1) {
        str += "\n\t " + this.sectionsBanner[i] + "\n\n";
        let j = 1;
        if (i > 0) j = sectionsLength[i - 1] + 1;
        sections[i].forEach((section, i) => {
          str += (i + j).toString() + ". " + section.message + "\n";
        });
      }
      str +=
        "\n\nMessage: Please authorize your app to use it's all features\n";
      str +=
        "\nCommmands =>\ne/exit: To exit\nr/reprint: To reprint current screen\n\n" +
        "Enter Choice:";

      return str;
    },
  };
  utils.mainMenuExec(featuresData);
};

const exportData = {};
exportData.mainScreen = mainScreen;

export default exportData;
