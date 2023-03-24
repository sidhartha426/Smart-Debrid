import { require } from "./index.js";
import { __filename, __dirname } from "./dir.js";

import data from "./data.js";
import utils from "./utils.js";
import { utils_t } from "./Seedbox/index.js";

const { readFile, writeFile } = data;

const path = "/home/sidhartha426/Downloads/Compressed";

let history = JSON.parse(
  readFile(__dirname + "/Seedbox/Data/add_t_history.json")
);
let archive = JSON.parse(
  readFile(__dirname + "/Seedbox/Data/add_t_archive.json")
);

let queue = JSON.parse(readFile(__dirname + "/Seedbox/Data/add_t_queue.json"));

console.log(Object.keys(history).length, history.order.length);

//let history2 = JSON.parse(readFile(path + "/add_t_history.json"));
//let archive2 = JSON.parse(readFile(path + "/add_t_archive.json"));
//let queue2 = JSON.parse(readFile(path + "/add_t_queue.json"));

// console.log(history.order.length, Object.keys(history).length);
// console.log(archive.order.length, Object.keys(archive).length);
// console.log(queue.length);
//
// console.log(archive[archive.order[archive.order.length-1]])
//
// console.log(archive[archive.order[archive.order.length-2]])

/*
queue.forEach((i)=>{
  if(i.includes("gsdfsd")||i.includes("Fox")){
    console.log(i);
  }
})
*/
