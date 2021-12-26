import { getButton } from '..'

export const getTttMoveButton = (idx: number) =>
  getButton(`ttt-move-${idx}`, idx.toString(), 'PRIMARY')
