import { useIntl } from "react-intl";

type MessageValues = Record<
	string,
	string | number | bigint | boolean | undefined
>;

export function useT() {
	const intl = useIntl();

	return (id: string, defaultMessage: string, values?: MessageValues): string =>
		intl.formatMessage(
			{
				id,
				defaultMessage,
			},
			values,
		);
}
