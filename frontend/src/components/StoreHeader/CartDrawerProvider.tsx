"use client";

import { useState } from "react";
import { CartDrawer, type CartDrawerProps } from "./CartDrawer";
import { FloatingCartButton } from "./FloatingCartButton";

export const CartDrawerProvider = (
	props: Omit<CartDrawerProps, "open" | "onOpenChange">
) => {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<CartDrawer {...props} open={isOpen} onOpenChange={setIsOpen} />
			<FloatingCartButton onOpenCart={() => setIsOpen(true)} />
		</>
	);
};
