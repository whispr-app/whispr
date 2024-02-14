export default (date: Date): string => {
	const today = new Date();
	const yesterday = new Date(today);
	yesterday.setDate(yesterday.getDate() - 1);

	const dateString = date.toLocaleDateString();
	const timeString = date.toLocaleTimeString([], {
		hour: '2-digit',
		minute: '2-digit'
	});

	if (dateString === today.toLocaleDateString()) {
		return `Today at ${timeString}`;
	} else if (dateString === yesterday.toLocaleDateString()) {
		return `Yesterday at ${timeString}`;
	} else {
		return `${dateString} at ${timeString}`;
	}
};
