
"use client";

import Link from 'next/link';
import Logo from './logo';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';

export const WebsiteFooter = () => {
    return (
        <footer className="bg-secondary text-secondary-foreground">
            <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-white">
                            <Logo />
                            <span className="font-bold text-xl">Etrain</span>
                        </Link>
                        <p className="text-sm leading-relaxed text-gray-400">Empowering education through digital innovation, providing tools for growth and connection.</p>
                        <div className="flex space-x-4 pt-2">
                           <Link href="#" className="text-gray-400 hover:text-white"><Facebook className="h-5 w-5" /></Link>
                           <Link href="#" className="text-gray-400 hover:text-white"><Twitter className="h-5 w-5" /></Link>
                           <Link href="#" className="text-gray-400 hover:text-white"><Instagram className="h-5 w-5" /></Link>
                           <Link href="#" className="text-gray-400 hover:text-white"><Linkedin className="h-5 w-5" /></Link>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Quick Links</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/about" className="text-gray-400 hover:text-white hover:underline">About</Link></li>
                            <li><Link href="/courses" className="text-gray-400 hover:text-white hover:underline">Courses</Link></li>
                            <li><Link href="/blog" className="text-gray-400 hover:text-white hover:underline">Blog</Link></li>
                            <li><Link href="/contact" className="text-gray-400 hover:text-white hover:underline">Contact</Link></li>
                        </ul>
                    </div>

                     <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Support</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/faq" className="text-gray-400 hover:text-white hover:underline">FAQ</Link></li>
                            <li><Link href="#" className="text-gray-400 hover:text-white hover:underline">Help Center</Link></li>
                            <li><Link href="/verification" className="text-gray-400 hover:text-white hover:underline">Verification</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                         <h3 className="text-lg font-semibold text-white">Subscribe</h3>
                         <p className="text-sm text-gray-400">Stay updated with our latest news and offers.</p>
                         <form className="flex flex-col sm:flex-row gap-2">
                            <Input type="email" placeholder="Your email" className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:ring-primary w-full" />
                            <Button className="gradient-button w-full sm:w-auto" type="submit">Subscribe</Button>
                         </form>
                    </div>
                </div>
            </div>
            <div className="border-t border-gray-700">
                <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-400">
                    <p>&copy; {new Date().getFullYear()} Etrain. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    );
};
