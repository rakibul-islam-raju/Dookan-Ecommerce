import type { ReactNode } from "react";
import { FormattedMessage } from "react-intl";

type RichMessageValues = Record<
	string,
	| string
	| number
	| bigint
	| boolean
	| ReactNode
	| undefined
>;

interface TranslateProps {
	id: string;
	defaultMessage: string;
	values?: RichMessageValues;
}

export function T({ id, defaultMessage, values }: TranslateProps) {
	return (
		<FormattedMessage id={id} defaultMessage={defaultMessage} values={values} />
	);
}
