import { require } from "./index.js";
import { __filename, __dirname } from "./dir.js";

import data from "./data.js";
import utils from "./utils.js";

import add_t from "./Seedbox/add_t.js";
import utils_t from "./Seedbox/utils_t.js";


const { readFile, writeFile } = data;

let history = JSON.parse(
  readFile(__dirname + "/Seedbox/Data/add_t_history.json")
);
let archive = JSON.parse(
  readFile(__dirname + "/Seedbox/Data/add_t_archive.json")
);

let queue = JSON.parse(readFile(__dirname + "/Seedbox/Data/add_t_queue.json"));

//Gives names and indexes of history records not present in Server

const weedHistory = () => {
  torrents.forEach((torrent) => {
    history[torrent.hashString] = false;
  });

  let s = "";
  let arr = history.order;

  for (let i = arr.length - 1; i >= 0; i -= 1) {
    if (history[arr[i]]) {
      j = arr.length - i;
      console.log(j, history[arr[i]].name, "\n");
      s += j + " ";
    }
  }
  console.log(s);
};

//Copies Records

const copyRecords = (inp, from, to, filePath) => {
  let indexes = utils.fetchIndexes(inp);
  for (let i = indexes.length - 1; i >= 0; i -= 1) {
    let j = indexes[i];
    let k = from.order.length - (j + 1);
    let hash = from.order[k];
    to.order.push(hash);
    to[hash] = from[hash];
  }
  writeFile(filePath, JSON.stringify(to));
};

//Displayes records

const displayRecords = (inp, from) => {
  let indexes = utils.fetchIndexes(inp);
  let order = from.order;

  indexes.forEach((i) => {
    const k = order[order.length - (i + 1)];
    console.log(from[k]);
  });
};

//displayRecords("10-5", history);
