/**
 * @remarks
 * This function fetches an argument from an process.argv list or returns a default value if not found (if provided)
 *
 * @example
 * Example of usage:
 * ```
 * argvFetcher(process.argv, ['-A', '--arg'], 'test')
 * ```
 *
 * @param argvs Process.argv list
 * @param args List of args wanted to be fetched (format: -A, --arg)
 * @param defaultReturn (optional) A default value to return if arg isn't found
 *
 * @returns the value of the argument
 */

export default (
  argvs: string[],
  args: string[],
  defaultReturn?: string
): string | undefined => {
  let value: string = '';
  argvs.forEach(argv => {
    args.forEach(arg => {
      if (argv.startsWith(arg)) {
        // format: --arg=value
        value = argv.split('=').slice(1).join('');
      }
    });
  });
  return value || defaultReturn;
};
