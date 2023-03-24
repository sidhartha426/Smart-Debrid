import { require } from "./index.js";
import { __filename, __dirname } from "./dir.js";
import { utils, myrequest, data } from "../index.js";
import utils_t from "./utils_t.js";

const { cls, commands, procesCmd } = data;

const mainScreen = (torrents) => {
  let requiredTorrents = [];
  let requiredIDs = [];

  const myoperations = [
    {
      message: "Delete all Torrents  (default:disabled)",
      value: false,
    },
    {
      message: "Manipulte Torrents  (default:disabled)",
      value: false,
    },
  ];

  const processInput = async (operations) => {
    //Manipulate Torrents
    if (operations[1].value) {
      torrents = await utils_t.manipulateTorrents(torrents);
      utils.dataCheck(torrents, "No torrents match your criteria");
    }

    //Select all or some torrents
    if (operations[0].value) {
      torrents.forEach((torrent) => {
        requiredIDs.push(torrent.id);
      });
      requiredTorrents = torrents;
    } else {
      const indexes = await utils.selectSome(
        torrents,
        utils_t.showTorrents,
        "Which Torrents to Delete:"
      );
      indexes.forEach((index) => {
        requiredIDs.push(torrents[index].id);
        requiredTorrents.push(torrents[index]);
      });
    }

    const checkResult = (result) => {
      if (requiredIDs.length !== result.length) return false;
      else {
        for (let i = 0; i < requiredIDs.length; i += 1)
          if (requiredIDs[i] !== result[i]) return false;
        return true;
      }
    };

    const makeRequest = async () => {
      console.log("Please Wait ... \nExecuting Request online\n\n");
      const requiredData = await myrequest
        .makeReadRequest("DELETE", data.path_delete_t(requiredIDs))
        .then((receivedData) => receivedData)
        .catch((err) => {
          cls();
          console.log(err);
          process.exit();
        });
      try {
        if (requiredData.success && checkResult(requiredData.value)) {
          cls();
          console.log("Request executed Successfully.\n");
          console.log("Deleted Torrents are:\n");
          utils.printNames(requiredTorrents);
          console.log(
            "\n" + requiredTorrents.length + " torrents deleted successfully"
          );
        } else {
          cls();
          console.log(requiredData);
        }
      } catch (e) {
        cls();
        console.log(e);
        process.exit();
      }
    };

    const makeConformation = await utils.confromationScreen(
      "Selected Torrents for Deletion:\n",
      requiredTorrents
    );

    if (makeConformation) makeRequest();
    else {
      console.log("Delete operation Cancelled");
    }
  };
  const banner = "\tDelete Torrents:\n\n";
  utils.dataCheck(torrents, "No torrents available");
  utils.execOperations(myoperations, processInput, false, banner);
};

const exportData = {};
exportData.mainScreen = mainScreen;
export default exportData;
