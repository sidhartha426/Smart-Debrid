const { data } = require("../Scripts/data.js");
const utils = require("../Scripts/utils.js");
const { cmdExec } = utils;

let str = "cat ../Download_Scripts/pattern-i.sh >> ";
let stre = "exec-i.sh";

for (let i = 1; i <= 3; i += 1) {
  data.writeFile(
    __dirname + "/d" + i + ".sh",
    str.replace(/pattern-i.sh/g, "d_download" + i + ".sh") +
      stre.replace(/exec-i.sh/g, "exec" + i + ".sh")
  );
  data.writeFile(
    __dirname + "/t" + i + ".sh",
    str.replace(/pattern-i.sh/g, "t_download" + i + ".sh") +
      stre.replace(/exec-i.sh/g, "exec" + i + ".sh")
  );
  data.writeFile(
    __dirname + "/tz" + i + ".sh",
    str.replace(/pattern-i.sh/g, "tz_download" + i + ".sh") +
      stre.replace(/exec-i.sh/g, "exec" + i + ".sh")
  );
}

let mf = async () => {
  await cmdExec('chmod +x "' + __dirname + '/"*.sh');
};
mf();
