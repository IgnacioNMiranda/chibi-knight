import { MessageAttachment } from 'discord.js'

export const getBotLogo = () => {
  return new MessageAttachment('./public/img/chibiKnightLogo.png', 'chibiKnightLogo.png')
}

export const botLogoURL = 'attachment://chibiKnightLogo.png'
