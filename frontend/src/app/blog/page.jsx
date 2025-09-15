import Image from 'next/image'
import React from 'react'
import blogImage from  '../../../public/images/person-img.png';
import { CalendarIcon, UserIcon } from '@/assets/Icons/Svg';

const Blog = () => {
    return (
        <div>
            <div
                className="min-h-[100px] flex items-center justify-center flex-col text-[20px] bg-gradient-to-r from-[#FFFDF4] to-[#FFE8CC] py-6"
            >
                <h3 className='text-center mb-5 text-[30px] text-black font-bold'>Blogs</h3>
                <div className="container text-center mx-auto px-6">
                    {`Home > Blogs`}
                </div>
            </div>
            <div className='py-10'>
                <div className='container mx-auto px-6'>
                    <div className='flex gap-5'>
                        <div className='flex-none w-[70%] grid grid-cols-2 gap-4'>
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
                        <div className='flex-none w-[30%]'>
                            <div className='blog-sidecard p-5 border-4 border-[#eee] mb-5'>
                                <h3 className='text-[25px] mb-5'>Recent Post</h3>
                                <div className='flex items-center gap-3 pb-3 border-b border-[#ccc] mb-3'>
                                    <Image src={blogImage} className='flex-none w-[70px] h-[70px] object-cover' />
                                    <div>
                                        <h4 className='line-clamp-1 text-[18px] font-semibold text-black'>What It's Like Dating Organic Food.</h4>
                                        <a href='#' className='text-customOrange font-semibold transition-all duration-300 hover:text-orange-700'>Read More</a>
                                    </div>
                                </div>
                                <div className='flex items-center gap-3 pb-3 border-b border-[#ccc] mb-3'>
                                    <Image src={blogImage} className='flex-none w-[70px] h-[70px] object-cover' />
                                    <div>
                                        <h4 className='line-clamp-1 text-[18px] font-semibold text-black'>What It's Like Dating Organic Food.</h4>
                                        <a href='#' className='text-customOrange font-semibold transition-all duration-300 hover:text-orange-700'>Read More</a>
                                    </div>
                                </div>
                                <div className='flex items-center gap-3 pb-3 border-b border-[#ccc] mb-3'>
                                    <Image src={blogImage} className='flex-none w-[70px] h-[70px] object-cover' />
                                    <div>
                                        <h4 className='line-clamp-1 text-[18px] font-semibold text-black'>What It's Like Dating Organic Food.</h4>
                                        <a href='#' className='text-customOrange font-semibold transition-all duration-300 hover:text-orange-700'>Read More</a>
                                    </div>
                                </div>
                                <div className='flex items-center gap-3 pb-3 border-b border-[#ccc] mb-3'>
                                    <Image src={blogImage} className='flex-none w-[70px] h-[70px] object-cover' />
                                    <div>
                                        <h4 className='line-clamp-1 text-[18px] font-semibold text-black'>What It's Like Dating Organic Food.</h4>
                                        <a href='#' className='text-customOrange font-semibold transition-all duration-300 hover:text-orange-700'>Read More</a>
                                    </div>
                                </div>
                                <div className='flex items-center gap-3 pb-3 border-b border-[#ccc] mb-3'>
                                    <Image src={blogImage} className='flex-none w-[70px] h-[70px] object-cover' />
                                    <div>
                                        <h4 className='line-clamp-1 text-[18px] font-semibold text-black'>What It's Like Dating Organic Food.</h4>
                                        <a href='#' className='text-customOrange font-semibold transition-all duration-300 hover:text-orange-700'>Read More</a>
                                    </div>
                                </div>
                                <div className='flex items-center gap-3'>
                                    <Image src={blogImage} className='flex-none w-[70px] h-[70px] object-cover' />
                                    <div>
                                        <h4 className='line-clamp-1 text-[18px] font-semibold text-black'>What It's Like Dating Organic Food.</h4>
                                        <a href='#' className='text-customOrange font-semibold transition-all duration-300 hover:text-orange-700'>Read More</a>
                                    </div>
                                </div>
                            </div>
                            <div className='blog-sidecard p-5 border-4 border-[#eee]'>
                                <h3 className='text-[25px] mb-5'>Tags</h3>
                                <div>
                                    <a href='#' className='inline-block px-4 py-3 text-[14px] bg-[#F2F6F7] font-semibold me-3 mb-3 hover:bg-customOrange transition-all duration-300 text-black hover:text-white'>Food</a>
                                    <a href='#' className='inline-block px-4 py-3 text-[14px] bg-[#F2F6F7] font-semibold me-3 mb-3 hover:bg-customOrange transition-all duration-300 text-black hover:text-white'>Garden</a>
                                    <a href='#' className='inline-block px-4 py-3 text-[14px] bg-[#F2F6F7] font-semibold me-3 mb-3 hover:bg-customOrange transition-all duration-300 text-black hover:text-white'>Natural</a>
                                    <a href='#' className='inline-block px-4 py-3 text-[14px] bg-[#F2F6F7] font-semibold me-3 mb-3 hover:bg-customOrange transition-all duration-300 text-black hover:text-white'>Organic</a>
                                    <a href='#' className='inline-block px-4 py-3 text-[14px] bg-[#F2F6F7] font-semibold me-3 mb-3 hover:bg-customOrange transition-all duration-300 text-black hover:text-white'>Muffins</a>
                                    <a href='#' className='inline-block px-4 py-3 text-[14px] bg-[#F2F6F7] font-semibold me-3 mb-3 hover:bg-customOrange transition-all duration-300 text-black hover:text-white'>Bread</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Blog
