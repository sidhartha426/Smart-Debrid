import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

mkdirSync("Scripts/Appauth/Data", { recursive: true });
mkdirSync("Scripts/Seedbox/Data", { recursive: true });
mkdirSync("Scripts/Downloader/Data", { recursive: true });
mkdirSync("Download_Scripts", { recursive: true });


const seedboxFiles = ['add_t_archive.json', 'add_t_history.json'];

const appAuthFiles = ['access_token.json', 'refresh_token.json', 'appinfo.json', 'tokeninfo.json'];

seedboxFiles.forEach((name) => {
  try {
    readFileSync("Scripts/Seedbox/Data/" + name)
  }
  catch (err) {
    writeFileSync("Scripts/Seedbox/Data/" + name, JSON.stringify({order:[]}));
  }
});

appAuthFiles.forEach((name) => {
  try {
    readFileSync("Scripts/Appauth/Data/" + name)
  }
  catch (err) {
    writeFileSync("Scripts/Appauth/Data/" + name, JSON.stringify({}));
  }
});

try {
  readFileSync("Scripts/Seedbox/Data/add_t_queue.json")
}
catch (err) {
  writeFileSync("Scripts/Seedbox/Data/add_t_queue.json", JSON.stringify([])); 
}

try {
  readFileSync("Scripts/Seedbox/Data/testdata.json")
}
catch (err) {
  writeFileSync("Scripts/Seedbox/Data/testdata.json", JSON.stringify({})); 
}

try {
  readFileSync("Scripts/Downloader/Data/testdata.json")
}
catch (err) {
  writeFileSync("Scripts/Downloader/Data/testdata.json", JSON.stringify({})); 
}

