"use client";

import { Bounce, ToastContainer } from "react-toastify";

export default function ToastProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			{children}
			<ToastContainer
				position="bottom-center"
				autoClose={5000}
				hideProgressBar={false}
				newestOnTop={false}
				closeOnClick={false}
				rtl={false}
				pauseOnFocusLoss
				draggable
				pauseOnHover
				theme="light"
				transition={Bounce}
			/>
		</>
	);
}
