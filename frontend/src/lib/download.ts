export const downloadBlob = (blob: Blob, fileName: string) => {
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");

	link.href = url;
	link.download = fileName;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	window.setTimeout(() => URL.revokeObjectURL(url), 0);
};

export const getInvoiceFileName = (orderNumber: string) =>
	`invoice-${orderNumber.replace(/[^a-z0-9-_.]/gi, "-")}.pdf`;
