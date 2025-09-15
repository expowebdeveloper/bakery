import Image from 'next/image'
import React from 'react'
import blogImage from '../../public/images/person-img.png';
import { CalendarIcon, UserIcon } from '@/assets/Icons/Svg';

function BlogCards() {
    return (
        <div>
            <div className='container mx-auto px-6 pt-10'>

                <div className="pt-10 pb-20 max-w-[1400px] mx-auto">
                    <h5 className="text-eyebrowColor font-semibold text-[20px] mb-7 text-center">
                        News & Blogs
                    </h5>
                    <h4 className="uppercase text-4xl md:text-5xl font-bebas text-center mb-10">
                        <span className="text-customOrange font-bebas">Latest </span>
                        News & Blogs
                    </h4>{" "}
                    <div className='flex-none grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4'>
                        <div className='blog-card'>
                            <div>
                                <Image src={blogImage} className='blog-card-img' />
                            </div>
                            <div className='px-4 pb-3'>
                                <div className='flex gap-5 border-b border-[#ccc] py-5 mb-4'>
                                    <div className='flex gap-2 items-center'>
                                        <span className='blog-card-icon'>{UserIcon}</span>
                                        <p className='mb-0 text-customOrange'>John Doe</p>
                                    </div>
                                    <div className='flex gap-2 items-center'>
                                        <span className='blog-card-icon'>{CalendarIcon}</span>
                                        <p className='mb-0 text-customOrange text-[14px]'>01 March 2025</p>
                                    </div>
                                </div>
                                <h2 className='text-[26px] font-bold mb-4'>15 Things You Should Know About Bakery Products.</h2>
                                <p className='text-[17px] text-[#222222] mb-3'>Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over...</p>
                                <a href='#' className='inline-block text-customOrange hover:text-orange-700 transition-all duration-300'>Read More</a>
                            </div>
                        </div>
                        <div className='blog-card'>
                            <div>
                                <Image src={blogImage} className='blog-card-img' />
                            </div>
                            <div className='px-4 pb-3'>
                                <div className='flex gap-5 border-b border-[#ccc] py-5 mb-4'>
                                    <div className='flex gap-2 items-center'>
                                        <span className='blog-card-icon'>{UserIcon}</span>
                                        <p className='mb-0 text-customOrange'>John Doe</p>
                                    </div>
                                    <div className='flex gap-2 items-center'>
                                        <span className='blog-card-icon'>{CalendarIcon}</span>
                                        <p className='mb-0 text-customOrange text-[14px]'>01 March 2025</p>
                                    </div>
                                </div>
                                <h2 className='text-[26px] font-bold mb-4'>15 Things You Should Know About Bakery Products.</h2>
                                <p className='text-[17px] text-[#222222] mb-3'>Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over...</p>
                                <a href='#' className='inline-block text-customOrange hover:text-orange-700 transition-all duration-300'>Read More</a>
                            </div>
                        </div>
                        <div className='blog-card'>
                            <div>
                                <Image src={blogImage} className='blog-card-img' />
                            </div>
                            <div className='px-4 pb-3'>
                                <div className='flex gap-5 border-b border-[#ccc] py-5 mb-4'>
                                    <div className='flex gap-2 items-center'>
                                        <span className='blog-card-icon'>{UserIcon}</span>
                                        <p className='mb-0 text-customOrange'>John Doe</p>
                                    </div>
                                    <div className='flex gap-2 items-center'>
                                        <span className='blog-card-icon'>{CalendarIcon}</span>
                                        <p className='mb-0 text-customOrange text-[14px]'>01 March 2025</p>
                                    </div>
                                </div>
                                <h2 className='text-[26px] font-bold mb-4'>15 Things You Should Know About Bakery Products.</h2>
                                <p className='text-[17px] text-[#222222] mb-3'>Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over...</p>
                                <a href='#' className='inline-block text-customOrange hover:text-orange-700 transition-all duration-300'>Read More</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BlogCards