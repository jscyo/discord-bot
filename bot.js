const { Client }  = require("discord.js")
require("dotenv").config()

const BOT_TOKEN = process.env.BOT_TOKEN

const bot = new Client({ intents: ["Guilds", "GuildMessages","MessageContent", "GuildMembers"] })
bot.login(BOT_TOKEN)

bot.on("ready", () => {
    console.log(`Bot ${bot.user.tag} is running`)
})


const INTRODUCIONS_CHANNEL_ID = process.env.INTRODUCIONS_CHANNEL_ID
const SUPPORT_CHANNEL_ID = process.env.SUPPORT_CHANNEL_ID
const MEMBER_ROLE_ID = process.env.MEMBER_ROLE_ID

function generateIntroductionMessage(memberId) {
    return `Hey <@${memberId}>, please introduce yourself to gain access to the rest of the server. Your introduction must start with !intro and must be longer than 20 characters.`
}


bot.on('guildMemberAdd', async member => {
    const channel = await bot.channels.fetch(INTRODUCIONS_CHANNEL_ID)
    channel.send({content: generateIntroductionMessage(member.id)})
})

bot.on("messageCreate", async msg => {

    if (msg.channel.id.toString() == INTRODUCIONS_CHANNEL_ID){

        const member = msg.guild.members.cache.get(msg.author.id)

        if (member.roles.cache.has(MEMBER_ROLE_ID)) {
            return msg.reply(`Hey <@${member.id}>, you already have access to the rest of the server. Please head to the #general channel to chat with the community.`)
        }

        if (!msg.content.startsWith("!intro")) {
            return msg.reply(`Your introduction must start with !intro and must be longer than 20 characters.`)
        }

        const message = msg.content.split("!intro")[1]
        const minMsgLength = 20
        if(message.length < minMsgLength) {
            return msg.reply(`Please introduce yourself with a message longer than ${minMsgLength} characters.`)
        }

        try {
            const memberRole = await msg.guild.roles.fetch(MEMBER_ROLE_ID)
            await member.roles.add(memberRole)
            return msg.reply(`Successfully introduced yourself! You now have access to the rest of the server. If you have any questions, please head to the <#${SUPPORT_CHANNEL_ID}> channel.`)

        } catch (error){
            console.log("Error: ", error)
        }
    }
})