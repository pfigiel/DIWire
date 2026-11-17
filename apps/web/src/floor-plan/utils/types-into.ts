/** Whether a key pressed there edits text, so Backspace must not also delete what is selected on the plan. */
export const typesInto = (target: EventTarget | null) =>
  target instanceof HTMLInputElement && target.type !== 'radio' && target.type !== 'checkbox'
