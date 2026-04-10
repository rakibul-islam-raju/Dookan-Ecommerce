export function CheckoutPaymentMethod() {
	return (
		<section className="space-y-4">
			<h2 className="text-xl font-semibold">Payment Method</h2>
			<p className="text-sm text-muted-foreground">
				All transactions are secure and encrypted.
			</p>
			<div className="border rounded-lg p-4 bg-muted/30">
				<div className="flex items-center gap-3">
					<div className="w-4 h-4 rounded-full border border-primary flex items-center justify-center">
						<div className="w-2 h-2 rounded-full bg-primary" />
					</div>
					<div>
						<span className="font-medium">Cash on Delivery (COD)</span>
						<p className="text-sm text-muted-foreground">
							Pay when you receive your order
						</p>
					</div>
				</div>
			</div>
		</section>
	);
}
