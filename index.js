const Discord = require('discord.js');
const bot = new Discord.Client();
const { KANAL, KATEGORI, LOG, GUILD, PREFIX } = require("./settings.json")
const { MessageEmbed } = require("discord.js");

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const db = low(adapter)


bot.on('ready', () => {
  console.log(`Giriş yapıldı! => ${bot.user.tag}!`);
});

bot.on("voiceStateUpdate", (oldState, newState) => {
    if(typeof oldState.channel == null || oldState.channel == null) return;

    if(oldState.channel.members.size == 0 && oldState.channel.parent.id == `${KATEGORI}` && oldState.channel.id !== `${KANAL}`){
        oldState.channel.delete()
        bot.channels.cache.get(`${LOG}`).send(`**${oldState.channel.name}** adlı kanal herkes ayrıldığı için silindi.`)
    }
})
bot.on("voiceStateUpdate", async (oldState, newState) => {
    if(typeof newState.channel == null || newState.channel == null) return;
    // if (newState.channel.id == `${KANAL}`){client.channels.cache.get(`${LOG}`).send("Kullanıcı başka bir kanala bağlandı!")}else{client.channels.cache.get(`${LOG}`).send("Kullanıcı doğru kanalda aga.")}

    if (newState.channel.id == `${KANAL}`){
        newState.guild.channels.cache.forEach(ch => {
            if(ch.parentID !== `${KATEGORI}`) return;
            if(ch.name == bot.guilds.cache.get(`${GUILD}`).members.cache.get(`${newState.member.id}`).nickname || ch.name == bot.guilds.cache.get(`${GUILD}`).members.cache.get(`${newState.member.id}`).displayName){
                db.set(`${newState.member.id}.durum`, "kanalvar").write()
            }else{
                db.set(`${newState.member.id}.durum`, "kanalyok").write()
            }
        })
        var data = db.get(`${newState.member.id}.durum`).value()
        if (data == "kanalvar") return bot.channels.cache.get(`${LOG}`).send(`<@${newState.member.id}>, sana özel bir kanal daha önceden oluşturulmuş, yeni bir kanal oluşturamazsın.`)
        bot.channels.cache.get(`${LOG}`).send(`<@${newState.member.id}>, kendine özel sesli kanal oluşturmak için **${newState.channel.name}** kanalına bağlandığını gördüm.\nSana özel kanal oluşturacağım ve seni taşıyacağım, **${PREFIX}limit** komutu ile kanalının maksimum üye sayısını ayarlayabilirsin.`)
        var kanalad = bot.guilds.cache.get(`${GUILD}`).members.cache.get(`${newState.member.id}`).nickname || bot.guilds.cache.get(`${GUILD}`).members.cache.get(`${newState.member.id}`).displayName
        var kanal = await newState.guild.channels.create(`${kanalad}`, {type : "voice", parent : `${KATEGORI}`, userLimit : 1})
        newState.member.voice.setChannel(kanal)
        // db.set(`${newState.member.id}`,`${kanal.id}`)
        // db.set(`${kanal.id}`, `${newState.member.id}`)
    }
})

bot.on("message", (msg) => {
    const args = msg.content.slice(PREFIX.length).trim().split(' ');
    const command = args.shift().toLowerCase();
    if(!msg.guild) return;
    const { channel } = msg.member.voice;
    if(command == `limit`){
        if(!channel) return msg.react("🚫");
        if(!args) return msg.react("🚫");
        if(msg.member.voice.channel.parent.id !== `${KATEGORI}`) return msg.react("🚫");
        if (isNaN(args[0])) return msg.react("🚫")
        if(args[0] > 99 || args[0] < 1) return msg.react("🚫");
        msg.member.voice.channel.setUserLimit(args[0], `İsteyen: ${msg.author.tag}`);
        msg.react("✅");
    }
    
})
bot.login("NzQ2MjgwMjAxNDYxMTcwMjI3.Xz-BmQ.rse0fos4faqxg3lC_oh1kDXPFfs")