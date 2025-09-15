"use client";
import { callApi, METHODS } from "@/_Api Handlers/apiFunctions";
import { EMAIL_SUBSCRIPTION_ENDPOINT } from "@/_Api Handlers/endpoints";
import { toastMessage } from "@/_utils/toastMessage";
import Link from "next/link";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import CommonButton from "./_common/CommonButton";

const Footer = () => {
  const { register, handleSubmit, formState: { errors }, setError } = useForm();
  const [email, setEmail] = useState("")
  const [loader, setLoader] = useState(false);

  const handleSubscribe = () => {
    setLoader(true);
    const payload = {
      email: email,
    }
    callApi({
      endPoint: EMAIL_SUBSCRIPTION_ENDPOINT,
      method: METHODS.post,
      payload: payload,
    })
      .then((res) => {
        toastMessage("Email Added Successfully", "success");
        setEmail("")
      })
      .catch((error) => {
        console.error("Error adding to favorites:", error);
        toastMessage("Failed to add Email", "error");
      }).finally(() => {
        setLoader(false);
      });
  }

  return (
    <>
      {/* <footer className="font-sans tracking-wide bg-black py-10 px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-12">
          <div>
            <h4 className="text-white text-lg font-semibold mb-6">Company</h4>
            <ul className="space-y-5">
              <li>
                <Link
                  href="javascript:void(0)"
                  className="text-gray-300 hover:text-white text-[15px]"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="javascript:void(0)"
                  className="text-gray-300 hover:text-white text-[15px]"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="javascript:void(0)"
                  className="text-gray-300 hover:text-white text-[15px]"
                >
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-lg font-semibold mb-6">
              Information
            </h4>
            <ul className="space-y-5">
              <li>
                <Link
                  href="javascript:void(0)"
                  className="text-gray-300 hover:text-white text-[15px]"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="javascript:void(0)"
                  className="text-gray-300 hover:text-white text-[15px]"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="javascript:void(0)"
                  className="text-gray-300 hover:text-white text-[15px]"
                >
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-lg font-semibold mb-6">Help</h4>
            <ul className="space-y-5">
              <li>
                <Link
                  href="javascript:void(0)"
                  className="text-gray-300 hover:text-white text-[15px]"
                >
                  FAQs
                </Link>
              </li>
              <li>
                <Link
                  href="javascript:void(0)"
                  className="text-gray-300 hover:text-white text-[15px]"
                >
                  Shipping Information
                </Link>
              </li>
              <li>
                <Link
                  href="javascript:void(0)"
                  className="text-gray-300 hover:text-white text-[15px]"
                >
                  Returns & Exchanges
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-full max-w-2xl">
            <h4 className="text-white text-lg font-semibold mb-6">
              Newsletter
            </h4>
            <p className="text-gray-300 mb-4 text-[15px]">
              Subscribe to our newsletter to get updates on new products and
              promotions.
            </p>

            <form onSubmit={handleSubmit(handleSubscribe)} className="mb-4">
              <div className="flex items-center">
                <input
                {...register('email', {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                  type="email"
                  placeholder="Enter your email"
                  className="bg-gray-800 px-4 py-3.5 rounded-l-md w-full text-[15px] text-gray-300 outline-none"
                  value={email}
                  onChange={(e)=>setEmail(e.target.value)}
                />
                <CommonButton
                  type="submit"
                  className="bg-gray-700 text-[15px] text-gray-300 tracking-wide px-4 py-3.5 rounded-r-md"
                  text="Subscribe"
                  loader={loader}
                />
              </div>
              {errors.email && (
                <span className="text-red-500 text-sm mt-2">{errors.email.message}</span>
              )}
            </form>
          </div>
        </div>
      </footer> */}
      {/* <footer className="bg-[#2C2C2C] text-white pt-20 pb-10">
        <div className="container mx-auto px-4 flex justify-between gap-8">
          <div className="flex-1">
            <h2 className="text-xl font-bold">LOGO</h2>
            <p className="mt-4 text-sm">
              We invite you to embark on a delicate journey through the enticing
              world of baking. Join us as we share mouthwatering recipes, baking
              tips and tricks, behind the scenes stories, and the aromatic magic
              that unfolds with our bakery.
            </p>
            <nav className="mt-6 flex flex-wrap gap-4 text-sm">
              <Link href="/" className="hover:underline">
                HOME
              </Link>
              <Link href="/" className="hover:underline">
                ABOUT US
              </Link>
              <Link href="/products" className="hover:underline">
                SHOP
              </Link>
              <Link href="/" className="hover:underline">
                BLOGS
              </Link>
              <Link href="/" className="hover:underline">
                CONTACT
              </Link>
            </nav>
          </div>

          <div className="flex-1">
            <div className="flex justify-around">
              <div>
                <h3 className="text-lg font-semibold">Address</h3>
                <p className="mt-2 text-sm">
                  Drottninggatan 25 <br />
                  111 51 Stockholm, Sweden
                </p>
              </div>
              <div>
                <h3 className=" text-lg font-semibold">Contact Info</h3>
                <p className="mt-2 text-sm">
                  info@bakery.com <br />
                  +46 8 123 456 78
                </p>
              </div>
            </div>

            <h3 className="text-lg font-semibold mt-6">
              Get everyday updates like promotional offers, features upgrades etc.
            </h3>
            <form onSubmit={handleSubmit(handleSubscribe)} className="mt-6">
              <div className="flex items-center">
                <input
                  {...register('email', {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                  type="email"
                  placeholder="Enter your email"
                  className="bg-gray-800 px-4 py-3.5 rounded-l-md w-full text-[15px] text-gray-300 outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <CommonButton
                  type="submit"
                  className="px-6 py-2 bg-[#F5D58D] text-black rounded-full hover:bg-[#eacb74]"
                  text="Subscribe"
                  loader={loader}
                />
              </div>
              {errors.email && (
                <span className="text-red-500 text-sm mt-2">{errors.email.message}</span>
              )}
            </form>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-10 pt-6">
          <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-sm">
            <p>Copyright 2024 Bakery. All rights reserved.</p>
            <div className="">
              <div>Follow us on social media</div>
              <div className="flex gap-4 mt-4 md:mt-0 justify-between">
                <a href="/" className="hover:text-gray-400">
                  <i className="fab fa-facebook-f">f</i>
                </a>
                <a href="/" className="hover:text-gray-400">
                  <i className="fab fa-twitter">t</i>
                </a>
                <a href="/" className="hover:text-gray-400">
                  <i className="fab fa-instagram">i</i>
                </a>
                <a href="/" className="hover:text-gray-400">
                  <i className="fab fa-google">g</i>
                </a>
              </div>
            </div>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="hover:underline">
                Privacy Policy
              </a>
              <a href="#" className="hover:underline">
                Terms of Use
              </a>
              <a href="#" className="hover:underline">
                Cookies Policy
              </a>
            </div>
          </div>
        </div>
      </footer> */}

      <footer className="bg-gray-100 pt-[60px] " style={{
                    background: "linear-gradient(95.58deg, #FFFAF4 0%, #FFDC83 99.47%)",
                }}>
        <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                    <h4 className="text-xl font-bold flex items-center">LOGO</h4>
                    <p className="text-gray-600 mt-2">We invite you to embark on a delicate journey through the enticing world of baking. Join us as we share mouthwatering recipes, baking tips and tricks, behind the scenes stories, and the aromatic magic that unfolds with our bakery.</p>
                    <p className="mt-2"><i className="fas fa-map-marker-alt"></i> Drottninggatan 25
                    111 51 Stockholm, Sweden</p>
                    <p><i className="fas fa-phone"></i> +46 8 123 456 78</p>
                    <p><i className="fas fa-envelope"></i> info@bakery.com</p>
                    <div className="flex space-x-4 mt-3 text-xl">
                        <a href="#" className="text-gray-700"><i className="fab fa-facebook-f"></i></a>
                        <a href="#" className="text-gray-700"><i className="fab fa-twitter"></i></a>
                        <a href="#" className="text-gray-700"><i className="fab fa-youtube"></i></a>
                        <a href="#" className="text-gray-700"><i className="fab fa-vimeo-v"></i></a>
                        <a href="#" className="text-gray-700"><i className="fab fa-tiktok"></i></a>
                    </div>
                </div>
                <div>
                    <h5 className="font-semibold">Company</h5>
                    <ul className="space-y-2 mt-2 text-gray-700">
                        <li><Link href="/" className="hover:underline">Home </Link></li>
                        <li><Link href="/" className="hover:underline">About Us</Link></li>
                        <li><Link href="/products" className="hover:underline"> Shop</Link></li>
                        <li><Link href="/" className="hover:underline">Blogs </Link></li>
                        <li><Link href="/" className="hover:underline"> Contact </Link></li>
                    </ul>
                </div>
                        
                <div>
                    <h5 className="font-semibold">Quick Links</h5>
                    <ul className="space-y-2 mt-2 text-gray-700">
                    <li><Link href="/" className="hover:underline">Orders </Link></li>
                        <li><Link href="/" className="hover:underline">Favourites</Link></li>
                        <li><Link href="/products" className="hover:underline"> Login</Link></li>
                        <li><Link href="/" className="hover:underline">My Account</Link></li>
                        <li><Link href="/" className="hover:underline">Terms of Service</Link></li>
                        <li><Link href="/" className="hover:underline">Promotional Offers</Link></li>
                    </ul>
                </div>
                <div>
                    <h5 className="font-semibold">Newsletter</h5>
                    <p className="text-gray-600 mt-2">Get everyday updates like promotional offers, features upgrades etc.</p>
                    <div className="flex mt-2">
                        <input type="email" placeholder="email@example.com" className="border px-3 py-2 w-full rounded-l-md"/>
                        <button className="bg-green-600 text-white px-4 py-2 rounded-r-md"><i className="fas fa-paper-plane"></i></button>
                    </div>
                    {/* <h5 className="font-semibold mt-4">We Accept</h5>
                    <div className="flex space-x-2 mt-2">
                        <img src="paypal.png" alt="PayPal" className="w-12"/>
                        <img src="visa.png" alt="Visa" className="w-12"/>
                        <img src="discover.png" alt="Discover" className="w-12"/>
                        <img src="mastercard.png" alt="Mastercard" className="w-12"/>
                        <img src="amex.png" alt="American Express" className="w-12"/>
                    </div> */}
                </div>
            </div>
            
        </div>
        <div className="py-3 bg-[#313131] mt-6 text-white">
                <div className="container mx-auto px-6">
                  <div className="flex items-baseline justify-between">
                    <p className="text-[14px]">Copyright 2024 &copy; <strong>Bakery.</strong>. All Rights Reserved.</p>
                    <div>
                        <a href="#" className="mr-3 text-[14px]">Terms of Service</a>
                        <a href="#" className="mr-3 text-[14px]">Claim</a>
                        <a href="#" className="text-[14px]">Privacy Policy</a>
                    </div>
                  </div>
                </div>
            </div>
    </footer>

    </>
  );
};

export default Footer;
