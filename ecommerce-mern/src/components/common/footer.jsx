import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

function Footer({ simplified = false }) {
    return (
        <footer className="bg-gray-900 text-white py-12 border-t-4 border-primary">
            {!simplified && (
                <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* About Us */}
                    <div>
                        <h3 className="text-xl font-bold mb-4">ECommerce</h3>
                        <p className="text-gray-400 text-sm">
                            Your one-stop shop for all your needs. Quality products, best prices, and fast delivery.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><a href="/shop/home" className="hover:text-white transition-colors">Home</a></li>
                            <li><a href="/shop/listing" className="hover:text-white transition-colors">Shop</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                        </ul>
                    </div>

                    {/* Follow Us */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <Facebook size={24} />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <Twitter size={24} />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <Instagram size={24} />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <Linkedin size={24} />
                            </a>
                        </div>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
                        <p className="text-gray-400 text-sm mb-4">Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.</p>
                        <form className="flex flex-col space-y-2">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded focus:outline-none focus:border-white"
                            />
                            <button className="px-4 py-2 bg-white text-black font-bold rounded hover:bg-gray-200 transition-colors">
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className="border-t border-gray-800 mt-10 pt-6 text-center">
                <p className="text-sm text-gray-500">
                    &copy; {new Date().getFullYear()} ECommerce. All rights reserved.
                </p>
                <p className="text-xs text-gray-600 mt-1 font-medium">
                    Developed and Designed by <a href="#" className="text-primary hover:underline">Manan Patel</a>
                </p>
            </div>
        </footer>
    );
}

export default Footer;
