import React from "react";
import ContactSection from "@/_components/ContactSection";
import Footer from "@/_components/Footer";
import HomePageBanner from "@/_components/HomePageBanner";
import Navbar from "@/_components/Navbar";
import Image from "next/image";
import AboutImage from '../../../public/images/about.webp';

const AboutUs = () => {
    return (
        <div>
            {" "}
            <div
                className="h-[100px] flex items-center justify-center text-[20px]"
                style={{
                    background: "linear-gradient(95.58deg, #FFFAF4 0%, #FFDC83 99.47%)",
                }}
            >{`Home > About Us`}
            </div>
            <section className="food-store">
                <div className="container-custome mx-auto px-6 py-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-[50px]">
                        <div >
                            <div className="relative">
                            <Image src={AboutImage} />
                            <div className="about-us-img-info about-us-img-info-2">
                                <div className="about-us-img-info-inner"><h1>25<span>+</span></h1><h6>Years Experience</h6><span class="dots-bottom"></span></div>
                            </div>
                            </div>
                        </div>
                        <div>
                        <h6 class="about-shop-heading">KNOW MORE ABOUT SHOP</h6>
                            <h1 className="text-[60px] font-bold mb-[15px] leading-[1]">Trusted Organic Food Store</h1>
                            <p className="ltn-sec-para">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore</p>
                            <p className="ltn-sec-para2 font-normal text-[16px] leading-[1.8] mt-[20px]">Lorem ipsum dolor sit amet, consectetur adipis icing elit, sed do eius mod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad min im veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequ at.</p>
                        </div>
                    </div>
                </div>
            </section>
            <section class="py-12 bg-gray-50">
                <div class="container mx-auto text-center">
                    <h5 class="text-green-500 text-sm">// FEATURES //</h5>
                    <h2 class="text-3xl font-bold mt-2">Why Choose Us!</h2>
                    <div class="grid grid-cols-3 gap-6 mt-6">
                        <div class="p-6 bg-white shadow-lg rounded-lg">
                            <h4 class="text-xl font-semibold">All Kind of Brands</h4>
                            <p class="text-gray-600 mt-2">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                        </div>
                        <div class="p-6 bg-white shadow-lg rounded-lg">
                            <h4 class="text-xl font-semibold">Brake Fluid Exchange</h4>
                            <p class="text-gray-600 mt-2">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                        </div>
                        <div class="p-6 bg-white shadow-lg rounded-lg">
                            <h4 class="text-xl font-semibold">Maintenance Package</h4>
                            <p class="text-gray-600 mt-2">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section class="py-12">
                <div class="container mx-auto text-center">
                    <h2 class="text-3xl font-bold">Team Member</h2>
                    <div class="grid grid-cols-4 gap-6 mt-6">
                        <div class="p-6 bg-white shadow-lg rounded-lg">
                            <img src="team1.jpg" alt="Founder" class="w-32 h-32 mx-auto rounded-full" />
                            <h4 class="mt-4 font-semibold">Rosalina D. William</h4>
                            <p class="text-green-500">Founder</p>
                        </div>
                        <div class="p-6 bg-white shadow-lg rounded-lg">
                            <img src="team2.jpg" alt="CEO" class="w-32 h-32 mx-auto rounded-full" />
                            <h4 class="mt-4 font-semibold">Jon Doe</h4>
                            <p class="text-green-500">CEO</p>
                        </div>
                        <div class="p-6 bg-white shadow-lg rounded-lg">
                            <img src="team3.jpg" alt="Manager" class="w-32 h-32 mx-auto rounded-full" />
                            <h4 class="mt-4 font-semibold">Alan Kamaro</h4>
                            <p class="text-green-500">Manager</p>
                        </div>
                        <div class="p-6 bg-white shadow-lg rounded-lg">
                            <img src="team4.jpg" alt="Service Holder" class="w-32 h-32 mx-auto rounded-full" />
                            <h4 class="mt-4 font-semibold">Chan Jaran</h4>
                            <p class="text-green-500">Service Holder</p>
                        </div>
                    </div>
                </div>
            </section>


        </div>
    );
};

export default AboutUs;