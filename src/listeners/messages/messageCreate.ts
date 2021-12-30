import { container, Events, Listener } from '@sapphire/framework'
import { Message } from 'discord.js'
import { configuration } from '@/config'
import { GuildData, User as DbUser } from '@/database'
import { defineRoles, logger } from '@/utils'
import { DocumentType } from '@typegoose/typegoose'

export class MessageCreateListener extends Listener<typeof Events.MessageCreate> {
  public async run(message: Message) {
    const notAllowedPrefix = ['>', '#', '$', '!', ';', 'rpg']
    const { content, author, guild } = message

    if (
      author.bot ||
      content.startsWith(configuration.client.defaultPrefix) ||
      guild === null ||
      notAllowedPrefix.some((prefix) => content.startsWith(prefix))
    ) {
      return
    }

    const { id: guildId } = guild
    let rolesActivated = false
    const cachedGuild = container.cache.get(guildId)
    if (cachedGuild) {
      rolesActivated = cachedGuild.rolesActivated
    } else {
      try {
        const guild = await container.db.guildService.getById(guildId)
        rolesActivated = guild.rolesActivated
      } catch (error) {}
    }

    if (!rolesActivated) {
      return
    }

    const messageWords = content.split(' ')
    const userRegex = /(<@![0-9]+>)/

    // Give points to valid messages.
    let score = 0
    const validWords = messageWords.filter((word) => word.length >= 2 && !word.match(userRegex)).length
    if (validWords >= 3) {
      score += 3
    }

    messageWords.some(async (word: string) => {
      if (word.match(userRegex)) {
        // <@! userId >
        const userId = word.substring(3, word.length - 1)
        try {
          const user = await message.guild.members.fetch(userId)
          if (user) {
            score += 2
          }
        } catch (error) {
          logger.error('There was a problem registering score from user interaction', {
            context: container.client.constructor.name,
          })
        }
      }
    })

    try {
      const user: DocumentType<DbUser> = await container.db.userService.getById(author.id)

      let finalParticipationScore = score
      if (user) {
        const guildDataIdx = user.guildsData.findIndex((guildData) => guildData.guildId === guildId)
        user.guildsData[guildDataIdx].participationScore += score
        finalParticipationScore = user.guildsData[guildDataIdx].participationScore
        await user.save()
      } else {
        const guildData: GuildData = {
          guildId,
          participationScore: score,
        }
        const newUser: DbUser = {
          discordId: author.id,
          name: author.username,
          guildsData: [guildData],
        }
        await container.db.userService.create(newUser)
      }

      const authorGuildMember = await message.guild.members.fetch(author.id)
      defineRoles(finalParticipationScore, authorGuildMember, message)
    } catch (error) {
      logger.error(`MongoDB Connection error. Could not register ${author.username}'s words points`, {
        context: container.client.constructor.name,
      })
    }
  }
}
