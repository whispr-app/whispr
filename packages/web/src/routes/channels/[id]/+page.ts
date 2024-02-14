export const prerender = false;
export const ssr = false;
export const load = ({ params }) => {
	return {
		slug: params.id
	};
};
