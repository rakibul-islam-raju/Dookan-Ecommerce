"use client";

import { useSiteConfigContext } from "@/lib/providers/site-config-provider";
import {
	Facebook,
	Instagram,
	Mail,
	MapPin,
	Phone,
	Youtube,
} from "lucide-react";
import Link from "next/link";
import { AppLogo } from "../AppLogo";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export const Footer = () => {
	const { config } = useSiteConfigContext();

	return (
		<footer className="bg-muted pt-16 pb-8 text-muted-foreground">
			<div className="container mx-auto px-4">
				{/* Top Section: Newsletter */}
				<div className="mb-16 grid gap-8 border-b border-border pb-12 lg:grid-cols-3 lg:gap-12">
					<div className="lg:col-span-2">
						<h3 className="text-2xl font-bold text-foreground">
							Join our newsletter
						</h3>
						<p className="mt-2 text-muted-foreground">
							We&apos;ll send you a nice letter once per week. No spam.
						</p>
					</div>
					<div className="flex flex-col justify-end gap-2">
						<Input placeholder="Enter your email" className="" />
						<Button size={"lg"} className="">
							Subscribe
						</Button>
					</div>
				</div>

				{/* Middle Section: Links */}
				<div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4 lg:gap-12">
					<div className="space-y-4">
						<div className="text-primary">
							<AppLogo />
						</div>
						<p className="text-sm leading-relaxed">
							{config?.tagline ||
								"Premium organic products sourced directly from nature. Quality you can trust, delivered to your doorstep."}
						</p>
						<div className="flex gap-4">
							{config?.facebook && (
								<Link
									href={config.facebook}
									target="_blank"
									rel="noopener noreferrer"
									className="hover:text-primary transition-colors"
								>
									<Facebook className="h-5 w-5" />
								</Link>
							)}
							{config?.instagram && (
								<Link
									href={config.instagram}
									target="_blank"
									rel="noopener noreferrer"
									className="hover:text-primary transition-colors"
								>
									<Instagram className="h-5 w-5" />
								</Link>
							)}
							{config?.youtube && (
								<Link
									href={config.youtube}
									target="_blank"
									rel="noopener noreferrer"
									className="hover:text-primary transition-colors"
								>
									<Youtube className="h-5 w-5" />
								</Link>
							)}
						</div>
					</div>

					<div>
						<h4 className="mb-4 text-lg font-semibold text-foreground">Shop</h4>
						<ul className="space-y-3 text-sm">
							<li>
								<Link
									href="/shop"
									className="hover:text-primary transition-colors"
								>
									All Products
								</Link>
							</li>
							<li>
								<Link
									href="/new-arrivals"
									className="hover:text-primary transition-colors"
								>
									New Arrivals
								</Link>
							</li>
							<li>
								<Link
									href="/featured"
									className="hover:text-primary transition-colors"
								>
									Featured
								</Link>
							</li>
							<li>
								<Link
									href="/deals"
									className="hover:text-primary transition-colors"
								>
									Deals & Discounts
								</Link>
							</li>
						</ul>
					</div>

					<div>
						<h4 className="mb-4 text-lg font-semibold text-foreground">
							Support
						</h4>
						<ul className="space-y-3 text-sm">
							<li>
								<Link
									href="/contact"
									className="hover:text-primary transition-colors"
								>
									Contact Us
								</Link>
							</li>
							<li>
								<Link
									href="/faq"
									className="hover:text-primary transition-colors"
								>
									FAQs
								</Link>
							</li>
							<li>
								<Link
									href="/shipping"
									className="hover:text-primary transition-colors"
								>
									Shipping & Returns
								</Link>
							</li>
							<li>
								<Link
									href="/privacy"
									className="hover:text-primary transition-colors"
								>
									Privacy Policy
								</Link>
							</li>
						</ul>
					</div>

					<div>
						<h4 className="mb-4 text-lg font-semibold text-foreground">
							Contact
						</h4>
						<ul className="space-y-3 text-sm">
							{config?.address && (
								<li className="flex items-start gap-3">
									<MapPin className="h-5 w-5 shrink-0 text-primary" />
									<span>{config.address}</span>
								</li>
							)}
							{config?.phone && (
								<li className="flex items-center gap-3">
									<Phone className="h-5 w-5 shrink-0 text-primary" />
									<a
										href={`tel:${config.phone}`}
										className="hover:text-primary transition-colors"
									>
										{config.phone}
									</a>
								</li>
							)}
							{config?.email && (
								<li className="flex items-center gap-3">
									<Mail className="h-5 w-5 shrink-0 text-primary" />
									<a
										href={`mailto:${config.email}`}
										className="hover:text-primary transition-colors"
									>
										{config.email}
									</a>
								</li>
							)}
						</ul>
					</div>
				</div>

				{/* Bottom Section: Copyright */}
				<div className="mt-16 border-t border-border pt-8 text-center text-sm">
					<p>
						&copy; {new Date().getFullYear()} {config?.name || "Dookan"}. All
						rights reserved.
					</p>
				</div>
			</div>
		</footer>
	);
};
