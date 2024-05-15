export enum TokenType {
	TEXT = 'TEXT',
	EMOJI = 'EMOJI'
}
export type Token = {
	type: TokenType;
	value: string;
};

export const emojiMatch = /(?<!\\):[A-Za-z-]+(?<!\\):/gm;
export const escapeMatch = /(?<!\\)(\\)/gm;

export const lex = async (text: string) => {
	const lexed = [];

	const emojis = text.match(emojiMatch) || [];

	while (!window.emojis) {
		await new Promise((resolve) => setTimeout(resolve, 100));
	}

	let lastIndex = 0;
	for (const emoji of emojis) {
		const emojiName = emoji.slice(1, emoji.length - 1);

		if (window.emojis.includes(emojiName) === false) continue;

		const index = text.indexOf(emoji, lastIndex);
		const before = text.slice(lastIndex, index);
		lastIndex = index + emoji.length;

		if (before) lexed.push({ type: TokenType.TEXT, value: before });
		lexed.push({ type: TokenType.EMOJI, value: emojiName });
	}

	const last = text.slice(lastIndex);
	if (last) lexed.push({ type: TokenType.TEXT, value: last });

	for (const token of lexed) {
		if (token.type === TokenType.TEXT) {
			token.value = token.value.replace(escapeMatch, '');
		}
	}

	return lexed;
};
