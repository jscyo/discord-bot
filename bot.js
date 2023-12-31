const { Client } = require("discord.js")
require("dotenv").config()

const BOT_TOKEN = process.env.BOT_TOKEN
const INTRODUCIONS_CHANNEL_ID = process.env.INTRODUCIONS_CHANNEL_ID
const SUPPORT_CHANNEL_ID = process.env.SUPPORT_CHANNEL_ID
const MEMBER_ROLE_ID = process.env.MEMBER_ROLE_ID


const bot = new Client({ intents: ["Guilds", "GuildMessages", "MessageContent", "GuildMembers"] })

bot.login(BOT_TOKEN)
bot.on("ready", () => {
    console.log(`Bot ${bot.user.tag} is running`)
})

// Listen for new members joining the server
bot.on('guildMemberAdd', async member => {
    const channel = await bot.channels.fetch(INTRODUCIONS_CHANNEL_ID)
    channel.send({ content: `Hey <@${member.id}>, please introduce yourself to gain access to the rest of the server. Your introduction must start with !intro and must be longer than 20 characters.` })
})


// Listen for messages
bot.on("messageCreate", async msg => {

    if (msg.channel.id.toString() == INTRODUCIONS_CHANNEL_ID) {

        const member = msg.guild.members.cache.get(msg.author.id)

        // Ignore bots
        if (member.user.bot) {
            return
        }

        // Ignore messages from members who already have access to the rest of the server
        if (member.roles.cache.has(MEMBER_ROLE_ID)) {
            return msg.reply(`Hey <@${member.id}>, you already have access to the rest of the server. Please head to the #general channel to chat with the community.`)
        }

        // Ignore messages that don't start with !intro
        if (!msg.content.startsWith("!intro")) {
            return msg.reply(`Your introduction must start with !intro and must be longer than 20 characters.`)
        }

        // Ignore messages that are too short
        const message = msg.content.split("!intro")[1]
        const minMsgLength = 20
        if (message.length < minMsgLength) {
            return msg.reply(`Please introduce yourself with a message longer than ${minMsgLength} characters.`)
        }

        try {
            const memberRole = await msg.guild.roles.fetch(MEMBER_ROLE_ID)
            await member.roles.add(memberRole)
            return msg.reply(`Successfully introduced yourself! You now have access to the rest of the server. If you have any questions, please head to the <#${SUPPORT_CHANNEL_ID}> channel to ask questions.`)

        } catch (error) {
            console.log("Error: ", error)
        }
    }
})