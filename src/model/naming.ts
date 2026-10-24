import { codePointLength } from './validation';
export function suggestTitle(description: string): string {
  const line = description.split(/\r?\n/).find(part => !!part.trim());
  return line && codePointLength(line) <= 60 ? `A beginning: ${line}` : 'An Unfinished Beginning';
}
