import { require } from "./index.js";
import { __filename, __dirname } from "./dir.js";
import { utils, myrequest, data } from "../index.js";
import utils_t from "./utils_t.js";

const {
  cls,
  commands,
  procesCmd,
  add_t,
  readFile,
  writeFile,
  URLKeywords,
} = data;

let history, archive, queue;

const readData = () => {
  history = JSON.parse(readFile(__dirname + "/Data/add_t_history.json"));
  archive = JSON.parse(readFile(__dirname + "/Data/add_t_archive.json"));
  queue = JSON.parse(readFile(__dirname + "/Data/add_t_queue.json"));
};

const refreshData = (torrents) => {
  let torder = [];
  const dataSet = new Set();
  const refreshHistory = () => {
    const compltedTorrents = torrents.filter((torrent) =>
      utils_t.checkCompleted(torrent)
    );
    if (compltedTorrents.length > 0) {
      compltedTorrents.forEach((torrent) => {
        if (history[torrent.hashString]) {
          if (!archive[torrent.hashString]) {
            torder.push(torrent.hashString);
            archive[torrent.hashString] = history[torrent.hashString];
            delete history[torrent.hashString];
            dataSet.add(torrent.hashString);
          } else {
            delete history[torrent.hashString];
            dataSet.add(torrent.hashString);
          }
        }
      });

      history.order = utils.removeData(history.order, dataSet);

      for (let i = torder.length - 1; i >= 0; i -= 1) {
        archive.order.push(torder[i]);
      }
    }
    writeHistory(history);
    writeArchive(archive);
  };
  readData();
  //console.log(history);
  if (torrents.length > 0 && history.order.length > 0) refreshHistory();
};

const writeHistory = (fdata) => {
  writeFile(__dirname + "/Data/add_t_history.json", JSON.stringify(fdata));
};
const writeQueue = (fdata) => {
  writeFile(__dirname + "/Data/add_t_queue.json", JSON.stringify(fdata));
};
const writeArchive = (fdata) => {
  writeFile(__dirname + "/Data/add_t_archive.json", JSON.stringify(fdata));
};

const modifyFile = (fdata) => {
  let content = "";
  fdata.forEach((record) => {
    content += record + "\n";
  });
  writeFile(__dirname + "/../../magnets.txt", content);
};

const mainScreen = (torrents) => {
  const myoperations = [
    {
      message: "Add Torrents from clipboard  (default:disabled)",
      value: false,
    },
    {
      message: "Add Torrents from magnets file  (default:disabled)",
      value: false,
    },
    {
      message: "Add Torrents from history  (default:disabled)",
      value: false,
    },
    {
      message: "Add Torrents from queue  (default:disabled)",
      value: false,
    },
    {
      message: "Add Torrents from archive  (default:disabled)",
      value: false,
    },
    {
      message: "Clear archive  (default:disabled)",
      value: false,
    },
    {
      message: "Clear queue  (default:disabled)",
      value: false,
    },
    {
      message: "Clear history  (default:disabled)",
      value: false,
    },
    {
      message: "Move history  (default:disabled)",
      value: false,
    },
  ];

  //Idea => add success /fail (processed) -> history add fail (unprocessed)-> queue
  //added&downloaded (processed)-> archive

  // object struct : order:[],hashString:{name:,url:}

  //Makes continueous requests after a urls array and returns results array
  const makeRequest = async (urls) => {
    const results = [];
    let s = 0;
    const mf = async (resolve) => {
      cls();
      console.log("Please Wait ... \nExecuting Request online\n\n");
      for (let i = 0; i < urls.length; i += 1) {
        let url = urls[i];
        const requiredData = await myrequest
          .makeWriteRequest("POST", add_t.path, add_t.getPostData(url))
          .then((receivedData) => receivedData)
          .catch((err) => {
            cls();
            console.log("add_t => makeRequest \n\n",err);
            return {success:false};
          });
        if (requiredData.success) {
          console.log("Request executed Successfully.");
          results.push(requiredData);
          s += 1;
        } else break;
      }
      if (s > 0) {
        cls();
        if (s !== urls.length) {
          console.log("\t", urls.length - s, "torrents added to queue.\n");
        }
        console.log("\t", s, "torrents added successfully.\n\n");
        results.forEach((result, i) => {
          console.log(i + 1, result.value.name, "\n");
        });
        console.log("\n");
        await utils.waitKeyStroke();
      }
      resolve(results);
    };
    return new Promise((resolve, reject) => {
      mf(resolve);
    });
  };

  //Updates history after successful results
  const updateHistory = async (results, urls) => {
    for (let i = results.length - 1; i >= 0; i -= 1) {
      let result = results[i];
      let torrent = result.value;
      if (!history[torrent.hashString]) {
        history.order.push(torrent.hashString);
        history[torrent.hashString] = {
          name: torrent.name,
          url: urls[i],
        };
      }
    }
  };

  //Updates queue
  const updateQueue = (arr) => {
    for (let i = arr.length - 1; i >= 0; i -= 1) {
      queue.push(arr[i]);
    }
  };

  //select something from clipboard
  const clipSelect = async (arr, msg) => {
    if (arr.length === 0) {
      console.log("No valid clips to add");
      process.exit();
    }
    let rarr = []; //array to be returned
    const mf = async (resolve) => {
      let indexes = await utils.selectSome(arr, utils.printFwdArr, msg);
      indexes.forEach((i) => {
        rarr.push(arr[i]);
      });
      resolve(rarr);
    };
    return new Promise((resolve, reject) => {
      mf(resolve);
    });
  };

  //Process file data
  const processFile = async (lineset) => {
    if (lineset.size === 0) {
      console.log("No valid links to add");
      process.exit();
    }
    let rarr = []; //required URLS
    const mf = async (resolve) => {
      let arr = Array.from(lineset);
      const msg = "Which urls to add:";
      let indexes = await utils.selectSome(arr, utils.printFwdArr, msg);
      indexes.forEach((i) => {
        rarr.push(arr[i]);
        lineset.delete(arr[i]);
      });
      modifyFile(Array.from(lineset));
      resolve(rarr);
    };
    return new Promise((resolve, reject) => {
      mf(resolve);
    });
  };

  //Process result (add in history and queue)
  const processResult = (results, urls) => {
    if (results.length > 0) {
      updateHistory(results, urls);
      updateQueue(urls.slice(results.length));
    } else {
      cls();
      console.log("Can't add torrents.\n");
      console.log(`\t${urls.length} torrents added to queue`)
      updateQueue(urls);
    }
  };

  const processInput = async (operations) => {
    //clipboard
    if (operations[0].value) {
      let clips = await utils.monitorClipboard((text) =>
        utils.searchKeywords(text, URLKeywords)
      );
      clips = await clipSelect(clips, "Select Which clips to send:");
      let results = await makeRequest(clips);
      processResult(results, clips);
    }
    //files
    if (operations[1].value) {
      let urls = add_t.getURLs;
      if (urls.length > 0) {
        urls = new Set(urls);
        urls = utils.filterSet(urls, (text) =>
          utils.searchKeywords(text, URLKeywords)
        );
        urls = await processFile(urls);
        let results = await makeRequest(urls);
        processResult(results, urls);
      } else console.log("No content present in file.");
    }
    //queue
    if (operations[3].value) {
      if (queue.length > 0) {
        const msg = "Select which urls to send:";
        const indexes = await utils.selectSome(queue, utils.printRevArr, msg);
        const tqueue = []; //temp queue
        const indexSet = new Set();
        indexes.forEach((i) => {
          tqueue.push(queue[queue.length - (i + 1)]);
          indexSet.add(queue.length - (i + 1));
        });
        queue = utils.removeIndexes(queue, indexSet);
        const results = await makeRequest(tqueue);
        processResult(results, tqueue);
      } else console.log("No records in queue.");
    }
    //history
    if (operations[2].value) {
      if (history.order.length > 0) {
        const msg = "Select which urls to send:";
        const indexes = await utils.selectSome(history, utils.printRevObj, msg);

        const tqueue = []; //temp queue holds array of urls to be added
        const torder = []; //temp order holds order of torrents to be added

        const indexSet = new Set();

        let order = history.order;
        indexes.forEach((i) => {
          tqueue.push(history[order[order.length - (i + 1)]].url);
          torder.push(order[order.length - (i + 1)]);
          indexSet.add(order.length - (i + 1));
        });

        history.order = utils.removeIndexes(order, indexSet);

        for (let i = torder.length - 1; i >= 0; i -= 1) {
          history.order.push(torder[i]);
        }

        const results = await makeRequest(tqueue);
        if (results.length === 0) {
          cls();
          console.log("Can't add torrents");
        }
      } else console.log("No records in history.");
    }
    //archive
    if (operations[4].value) {
      if (archive.order.length > 0) {
        const msg = "Select which urls to send:";
        const indexes = await utils.selectSome(archive, utils.printRevObj, msg);

        const tqueue = []; //temp queue holds array of urls to be added
        const torder = []; //temp order holds order of torrents to be added

        const indexSet = new Set();

        let order = archive.order;
        indexes.forEach((i) => {
          tqueue.push(archive[order[order.length - (i + 1)]].url);
          torder.push(order[order.length - (i + 1)]);
          indexSet.add(order.length - (i + 1));
        });

        archive.order = utils.removeIndexes(order, indexSet);

        for (let i = torder.length - 1; i >= 0; i -= 1) {
          const hash = torder[i];
          history.order.push(hash);
          history[hash] = archive[hash];
          delete archive[hash];
        }
        const results = await makeRequest(tqueue);
        if (results.length === 0) {
          cls();
          console.log("Can't add torrents");
        }
      } else console.log("No records in archive.");
    }
    //clear archive
    if (operations[5].value) {
      archive = await utils.modifyObj(archive);
    }
    //clear history
    if (operations[7].value) {
      history = await utils.modifyObj(history);
    }
    //clear queue
    if (operations[6].value) {
      queue = await utils.modifyArr(queue);
    }
    //Move History
    if (operations[8].value) {
      if (history.order.length > 0) {
        const msg = "Select which urls to move:";
        const indexes = await utils.selectSome(history, utils.printRevObj, msg);

        const indexSet = new Set();

        let order = history.order;

        indexes.forEach((i) => {
          indexSet.add(order.length - (i + 1));
          const hash=order[order.length - (i + 1)];
          archive[hash]=history[hash];
          archive.order.push(hash);
          delete history[hash];
        });

        history.order = utils.removeIndexes(order, indexSet);

        console.log(indexes.length," records moved to archive");

      } else console.log("No records in history.");
    }

    writeHistory(history);
    writeQueue(queue);
    writeArchive(archive);
  };

  const banner = "\tAdd Torrents:\n\n";
  refreshData(torrents);
  utils.execOperations(myoperations, processInput, false, banner);
};

const exportData = {};
exportData.mainScreen = mainScreen;
exportData.refreshData = refreshData;
export default exportData;
