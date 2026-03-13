"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Leaf, ShieldCheck, Truck } from "lucide-react";
import Link from "next/link";

export const Hero = () => {
	return (
		<section className="relative bg-linear-to-br from-primary/5 via-background to-secondary/10 overflow-hidden">
			{/* Decorative Elements */}
			<div className="absolute inset-0 opacity-10">
				<div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-3xl" />
				<div className="absolute bottom-20 right-10 w-96 h-96 bg-accent rounded-full blur-3xl" />
			</div>

			<div className="container relative pt-4 pb-12">
				<div className="grid lg:grid-cols-2 gap-12 items-center">
					{/* Left Content */}
					<div className="space-y-8 text-center lg:text-left">
						<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
							<Leaf className="size-4" />
							100% Organic & Natural
						</div>

						<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif text-foreground leading-tight">
							Fresh & Healthy
							<span className="block text-primary mt-2">Organic Products</span>
						</h1>

						<p className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
							Discover our premium selection of organic, sustainable, and
							eco-friendly products. Quality you can trust, delivered to your
							doorstep.
						</p>

						<div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
							<Button size="lg" className="text-base h-12 px-8" asChild>
								<Link href="/shop">
									Shop Now <ArrowRight className="ml-2 size-5" />
								</Link>
							</Button>
							<Button
								size="lg"
								variant="outline"
								className="text-base h-12 px-8"
								asChild
							>
								<Link href="/about">Learn More</Link>
							</Button>
						</div>

						{/* Features */}
						<div className="grid grid-cols-3 gap-4 pt-8 border-t border-border/50">
							<div className="flex flex-col items-center lg:items-start gap-2">
								<div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
									<Truck className="size-5 text-primary" />
								</div>
								<div className="text-center lg:text-left">
									<p className="font-semibold text-sm">Free Shipping</p>
									<p className="text-xs text-muted-foreground">
										On orders $50+
									</p>
								</div>
							</div>
							<div className="flex flex-col items-center lg:items-start gap-2">
								<div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
									<ShieldCheck className="size-5 text-primary" />
								</div>
								<div className="text-center lg:text-left">
									<p className="font-semibold text-sm">Secure Payment</p>
									<p className="text-xs text-muted-foreground">
										100% Protected
									</p>
								</div>
							</div>
							<div className="flex flex-col items-center lg:items-start gap-2">
								<div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
									<Leaf className="size-5 text-primary" />
								</div>
								<div className="text-center lg:text-left">
									<p className="font-semibold text-sm">100% Organic</p>
									<p className="text-xs text-muted-foreground">
										Certified Products
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Right Image */}
					<div className="relative hidden lg:block">
						<div className="relative aspect-square rounded-2xl overflow-hidden">
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000&auto=format&fit=crop"
								alt="Fresh organic products"
								className="object-cover w-full h-full"
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
						</div>

						{/* Floating Badge */}
						<div className="absolute -bottom-6 -left-6 bg-card border shadow-lg rounded-2xl p-6 max-w-[200px]">
							<div className="flex items-center gap-3">
								<div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
									<span className="text-2xl font-bold text-primary">🌿</span>
								</div>
								<div>
									<p className="font-bold text-lg">500+</p>
									<p className="text-xs text-muted-foreground">
										Organic Products
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};
