'use strict'

const Plugin = {
    "name": "Level",
    "version": "1.0.0",
    "depends": {
        "pluginLoader": ">=4.8.5",
        "DataBase": ">=3.0.0",
        "UUID": ">=1.0.1"
    },
    "Events": ["messageCreate"],
    "Commands": [
        {
            "name": "level info",
            "note": "關於等級系統"
        },
        {
            "name": "sign",
            "note": "每日簽到"
        },
        {
            "name": "me",
            "note": "查看關於自己的數據"
        },
        {
            "name": "rank",
            "note": "查看排行榜"
        }
    ],
    "author": ["whes1015"],
    "link": "https://github.com/ExpTechTW/MPR-Level",
    "resources": ["AGPL-3.0"],
    "description": "等級系統",
    "DHL": false
}

const DB = require("./DataBase")
const pluginLoader = require('../Core/pluginLoader')


async function messageCreate(client, message) {
    let Reset = DB.read(Plugin, "Reset")
    if (Reset == false || Reset == null || Reset != new Date().getMonth()) {
        DB.write(Plugin, "Reset", new Date().getMonth())
        DB.write(Plugin, "LevelData", [])
    }
    if (message.content == "sign") {
        let user = await DB.read(Plugin, "LevelData")
        let today = Math.floor((Math.random() * 350))
        for (let index = 0; index < user.length; index++) {
            if (user[index]["id"] == message.author.id) {
                if (user[index]["TimeStamp"] >= new Date().getTime()) {
                    await message.reply(await pluginLoader.embed(`尚無法 簽到\n下次簽到時間: ${time(user[index]["TimeStamp"])}`))
                    return
                } else {
                    let today = Math.floor((Math.random() * 350))
                    user[index]["EXP"] = user[index]["EXP"] + today
                    user[index]["TimeStamp"] = new Date().getTime() + 86400000
                    user[index]["Name"] = message.member.displayName
                    DB.write(Plugin, "LevelData", user)
                    await message.reply(await pluginLoader.embed(`已完成 簽到 EXP + ${today}\n下次簽到時間: ${time(new Date().getTime() + 86400000)}`))
                    return
                }
            }
        }
        user.push({
            "Name": message.member.displayName,
            "id": message.author.id,
            "EXP": today,
            "TimeStamp": new Date().getTime() + 86400000,
            "TodayEXP": 0,
            "TodayTimeStamp": 0,
            "MinutesLimit": 0
        })
        DB.write(Plugin, "LevelData", user)
        await message.reply(await pluginLoader.embed(`已完成 簽到 EXP + ${today}\n下次簽到時間: ${time(new Date().getTime() + 86400000)}`))
    } else if (message.content == "level info") {
        await message.reply(await pluginLoader.embed(`每日簽到 +0 ~ +350\n聊天 +0 ~ +20 (每日上限 +500)\n邀請一個人進群組 +1000\n\n**LV0** | 0\n**LV1** | 50\n**LV2** | 200\n**LV3** | 1500\n**LV4** | 4500\n**LV5** | 10800\n**LV6** | 28800\n\n等級系統每月重置`))
    } else if (message.content == "me") {
        let user = await DB.read(Plugin, "LevelData")
        for (let index = 0; index < user.length; index++) {
            if (user[index]["id"] == message.author.id) {
                let LV = 0
                if (user[index]["EXP"] >= 28800) {
                    LV = 6
                } else if (user[index]["EXP"] >= 10800) {
                    LV = 5
                } else if (user[index]["EXP"] >= 4500) {
                    LV = 4
                } else if (user[index]["EXP"] >= 1500) {
                    LV = 3
                } else if (user[index]["EXP"] >= 200) {
                    LV = 2
                } else if (user[index]["EXP"] >= 50) {
                    LV = 1
                }
                await message.reply(await pluginLoader.embed(`**${message.member.displayName}**\n${user[index]["id"]}\n\n**EXP**\n+${user[index]["EXP"]}\n**LV**\n**${LV}**\n\n**今日獲得**\n+${user[index]["TodayEXP"]}`))
                return
            }
        }
    } else if (message.content == "rank") {
        let User = await DB.read(Plugin, "LevelData")
        let New = []
        let times = User.length
        for (let index = 0; index < times; index++) {
            let Stamp = 0
            let loc = -1
            for (let Index = 0; Index < User.length; Index++) {
                if (User[Index]["EXP"] > Stamp) {
                    Stamp = User[Index]["EXP"]
                    loc = Index
                }
            }
            New.push(User[loc])
            User.splice(loc, 1)
        }
        let msg = ""
        for (let index = 0; index < New.length; index++) {
            if (index > 10) break
            msg = msg + `${index + 1}. ${New[index]["Name"]} | EXP +${New[index]["EXP"]}\n`
        }
        for (let index = 0; index < New.length; index++) {
            if (New[index]["id"] == message.author.id) {
                msg = msg + `\n\n${index + 1}. ${New[index]["Name"]} | EXP +${New[index]["EXP"]}`
                break
            }
        }
        await message.reply(await pluginLoader.embed(msg))
    } else {
        let user = await DB.read(Plugin, "LevelData")
        for (let index = 0; index < user.length; index++) {
            if (user[index]["id"] == message.author.id) {
                let exp = Math.floor((Math.random() * 25))
                if (new Date().getTime() - user[index]["TodayTimeStamp"] >= 86400000) {
                    user[index]["TodayEXP"] = exp
                    user[index]["TodayTimeStamp"] = new Date().getTime()
                } else {
                    if (user[index]["TodayEXP"] + exp >= 500) {
                        user[index]["TodayEXP"] = 500
                    } else {
                        if (new Date().getTime() - user[index]["MinutesLimit"] >= 60000) {
                            user[index]["TodayEXP"] = user[index]["TodayEXP"] + exp
                            user[index]["MinutesLimit"] = new Date().getTime()
                        }
                    }
                }
                DB.write(Plugin, "LevelData", user)
                break
            }
        }
    }
}

function time(time) {
    let utc = new Date()
    let now = new Date(time + utc.getTimezoneOffset() * 60 * 1000 + 60 * 60 * 8 * 1000)
    let Now = now.getFullYear() +
        "/" + (now.getMonth() + 1) +
        "/" + now.getDate() +
        " " + now.getHours() +
        ":" + now.getMinutes() +
        ":" + now.getSeconds()
    return Now
}

module.exports = {
    Plugin,
    messageCreate,
}
