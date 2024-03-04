"use strict";
const { default: makeWASocket, delay, makeCacheableSignalKeyStore, updateMessageWithPollUpdate, useMultiFileAuthState } = require("./Baileys_x");
const store = {};
const fs = require("node:fs");
const cp = require("node:child_process");
const ytdl = require("./add/node_modules/ytdl-core");
const { random, ExeCMD, YTUltimateV, YTUltimateA } = require("./functions");
const ytsearch = require("./add/node_modules/ytsearch-node");

// https://huggingface.co/spaces/typeofxn60/project

const connectOnWhatsApp = async () => {
   const { state, saveCreds } = await useMultiFileAuthState("./session");
   const wpp = makeWASocket({
      printQRInTerminal: false,
      auth: {
         keys: makeCacheableSignalKeyStore(state.keys),
         creds: state.creds
      }
   });

   // if(!wpp.authState.creds.registered) {
   //    const code = await wpp.requestPairingCode("559984620740")
   //    console.log(`Pairing code: ${code}`)
   // }

   wpp.ev.on("creds.update", saveCreds);
   wpp.ev.on("messages.upsert", ({ messages, type: msgType }) => messages.forEach(async ({ message, key, pushName }, id) => { store[key.id] = messages[id];
      try {
         if (key.remoteJid == 'status@broadcast') return;
			if (key.id.startsWith('BAE5') || key.id.startsWith('SEX5')) return;
			const type = Object.keys(message || {}).filter((i) => !i.match(/Distribution|ContextInfo/gi) && i)[0];
			const chat = key.remoteJid.endsWith('@g.us');
         const timedat = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
         const content = JSON.stringify(message);
         const body = (type == 'conversation' ? message.conversation : (type == 'imageMessage') ? message.imageMessage.caption : (type == 'videoMessage') ? message.videoMessage.caption : (type == 'extendedTextMessage') ? message.extendedTextMessage.text : (type == 'buttonsResponseMessage') ? message.buttonsResponseMessage.selectedButtonId : (type == 'listResponseMessage') ? message.listResponseMessage.singleSelectReply.selectedRowId : (type == 'templateButtonReplyMessage') ? message.templateButtonReplyMessage.selectedId : (type === 'messageContextInfo') ? (message.buttonsResponseMessage?.selectedButtonId || message.listResponseMessage?.singleSelectReply.selectedRowId || message.text) : (type == 'senderKeyDistributionMessage') ? (message.conversation ? message.conversation : (message.extendedTextMessage ? message.extendedTextMessage.text : '')) : '');
         const from = key.remoteJid;
         const sender = chat ? key.participant : key.remoteJid;
         const params = body ? body.trim().split(" ").slice(1) : [];
         const Gmetadata = chat ? await wpp.groupMetadata(from).catch(() => {}) : {};
         const groupName = chat ? Gmetadata?.subject : '';
         const prefix = body.startsWith("$") ? "$" : false;
         const whacmd = prefix  ? body.replace(prefix, '').trim().split(" ").shift().toLowerCase() : false;
         const participants = chat ? Gmetadata?.participants : [];
         const listOfAdmins = chat ? participants?.map(({ admin, id }) => admin && id || { id }) : [];
         const iAdmin = listOfAdmins?.includes(sender);
         const _react = (emoji) => wpp.sendMessage(from, { react: { text: emoji, key } });
         // const IAdmin = listOfAdmins?.includes(wpp.user.id.split(':')[0] + "@s.whatsapp.net");

         console.log('\x1b[1;31m~\x1b[1;37m>', (whacmd ? '[\x1b[1;32mEXEC\x1b[1;37m]' : '[\x1b[1;31mRECV\x1b[1;37m]'), timedat, require('chalk').green.underline(whacmd ? whacmd : body || (type ? String(type).slice(0, -7) : 'baileys')), require('chalk').red('from'), require('chalk').green.underline(pushName.toString() || 'no name') + (chat ? (require('chalk').red(' in ') + require('chalk').green.underline(groupName || 'desconhecido...')) : ""));

         wpp.ev.process(async (events) => {
            if(events['messages.update']) {
               console.log(
                  JSON.stringify(events['messages.update'], undefined, 2)
               )
            }
         });

         switch (msgType == 'notify' ? whacmd : messages[id].messageSTubTYpe) {
            case "video":
               if (!((store[sender] && store[sender][params-1])   || params.join("").match(/youtu/g))) return _react("✖️");_react("✔");
               var link =  (store[sender][params-1].link || params);
               var data =  await ytdl.getInfo(link);
               
               YTUltimateV(data,random(8) + ".mp4").then((file) => wpp.sendMessage(from, { video: fs.readFileSync(file) }));
            break

            case "audio":
               if (!((store[sender] && store[sender][params-1])   || params.join("").match(/youtu/g))) return _react("✖️");_react("✔");
               var link =  (store[sender][params-1].link || params);
               var data =  await ytdl.getInfo(link);

               YTUltimateA(data,random(8) + ".mp4").then((file) => wpp.sendMessage(from, { audio: fs.readFileSync(file) }));
            break

            case "ytsearch":
               const req = await ytsearch(params.join(" "));
               const res = req.map((i) =>({ title: i.title, duration: i.duration, views: i.shortViewCount, thumbnail: i.thumbnail.url, channel: i.author.name, published: i.publishedAt, link: i.watchUrl })); store[sender] = res;

               const str = res.map((i, es) => ((es+1) + "\nTítulo: " + (i.title.length > 50 ? (i.title.substr(0, 50) + "...") : i.title) + "\nCanal: " + i.channel + "\nDuração: " + i.duration + "\nViews: " + i.views + "\nData de publicação: " + (i.published || "..."))).join("\n\n");
               wpp.sendMessage(from, { text: str }, { quoted: message[id] });
            break

            case "poll":
               const buttons = [
                  {buttonId: 'id1', buttonText: {displayText: 'Button 1'}, type: 1},
                  {buttonId: 'id2', buttonText: {displayText: 'Button 2'}, type: 1},
                  {buttonId: 'id3', buttonText: {displayText: 'Button 3'}, type: 1}
                ]
                
                const buttonMessage = {
                    caption: "Hi it's button message",
                    footer: 'Hello World',
                    buttons: buttons
                }
                
                 await wpp.sendMessage(from, buttonMessage)
            break

            case "option":
               console.log(store[sender][params-1])
            break
         };
      }
      catch (err) {
         console.log("Upsert: ", err);
      };
   }));

   wpp.ev.process(async (events) => {
      if (events["connection.update"]) {
         const update = events["connection.update"];
         const { connection, lastDisconnect } = update;
         if (connection === "close") {
            if (
               lastDisconnect
            ) {
               connectOnWhatsApp();
            } else {
               console.log("Connection closed. You are logged out.");
            }
         }
         console.log("connection update", update);
      }
   });
}

connectOnWhatsApp();