import { MessageButtonStyle, EmojiIdentifierResolvable, MessageButton } from 'discord.js'

export const getButton = (id: string, label: string, style: MessageButtonStyle, emoji?: EmojiIdentifierResolvable) => {
  return new MessageButton().setCustomId(id).setEmoji(emoji).setLabel(label).setStyle(style)
}
