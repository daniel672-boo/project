const fs = require("node:fs");
const cp = require("node:child_process");
const ytdl = require("./add/node_modules/ytdl-core");


const ExeCMD = async (command) =>  new Promise((resolve, reject) => {
    cp.exec(command, (errored) =>  {
        if (errored) return reject()
        ;;;resolve()
    });
});

const random = (number) => [...Array(number)].map((i) => Array.from("0987654321zxcvbnmlkjhgfdsapoiuytrewq1234567890")[Math.floor(Math.random() * 45)]).join("");

const Download = async (data, option, ext) => {
    for (let i of (data.formats.filter((t) => option.includes(t.itag)))) {
        try {
            await (new Promise((resolve,t) => ytdl(data.videoDetails.video_url, { quality: i.itag }).pipe(fs.createWriteStream(`${ext}.${i.container}`)).on("finish", () => resolve()))); return `${ext}.${i.container}`;
            break
            }
            catch (err) {
            console.log(i.itag, err, "error")
            continue
        };
    };
};


const YTUltimateV = async (data, file) => new Promise((resolve, reject) => Download(data, [248, 247, 244], random(8)).then((v) => Download(data, [251, 250, 249], random(8)).then((a) => ExeCMD (`ffmpeg -i ${v} -i ${a} -c copy ${file}`).then(() => resolve(file)))));
const YTUltimateA = async (data, file) => new Promise((resolve, reject) => Download(data, [251, 250, 249], random(8)).then((a) =>   ExeCMD(`ffmpeg -i ${a} -c copy ${file}`).then(( ) => resolve(file))));

module.exports = { ExeCMD, random, YTUltimateV, YTUltimateA }