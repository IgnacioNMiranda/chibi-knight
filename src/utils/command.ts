import { Args, Command, CommandContext } from '@sapphire/framework'
import { fetchT, TFunction } from '@sapphire/plugin-i18next'
import { Message } from 'discord.js'
import * as Lexure from 'lexure'

export abstract class CustomCommand extends Command {
  constructor(context: Command.Context, options: Command.Options) {
    super(context, { ...options })
  }

  /**
   * The pre-parse method. This method can be overridden by plugins to define their own argument parser.
   * @param message The message that triggered the command.
   * @param parameters The raw parameters as a single string.
   * @param context The command-context used in this execution.
   */
  public async preParse(message: Message, parameters: string, context: CommandContext): Promise<Args> {
    const parser = new Lexure.Parser(this.lexer.setInput(parameters).lex()).setUnorderedStrategy(this.strategy)
    const args = new Lexure.Args(parser.parse())
    return new CustomArgs(message, this, args, context, await fetchT(message))
  }
}

export class CustomArgs extends Args {
  public t: TFunction // result of 'await fetchT', obtains locale texts.

  public constructor(message: Message, command: Command, parser: Lexure.Args, context: CommandContext, t: TFunction) {
    super(message, command, parser, context)
    this.t = t
  }
}
