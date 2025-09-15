import React from 'react'
import blogImage from '../../../../public/images/person-img.png';
import { CalendarIcon, UserIcon } from '@/assets/Icons/Svg';
import Image from 'next/image'

const SingleBlog = () => {
    return (
        <div>
            <div>

                <div
                    className="min-h-[100px] flex items-center justify-center flex-col text-[20px] bg-gradient-to-r from-[#FFFDF4] to-[#FFE8CC] py-6"
                >
                    <h3 className='text-center mb-5 text-[30px] text-black font-bold'>15 Things You Should Know About Bakery Products.</h3>
                    <div className="container text-center mx-auto px-6">
                        {`Home > Blogs > 15 Things You Should Know About Bakery Products`}
                    </div>
                </div>
            </div>
            <div className='py-10'>
                <div className='container mx-auto px-6'>
                    <div className='flex gap-5'>
                        <div className="flex-none w-[70%]">
                            <div className="p-6 border-4 border-[#eee]">
                                <Image src={blogImage} className='w-full mb-4' />
                                <h3 className='text-[26px] font-bold mb-4'>How To Get People To Like Organic Food.</h3>
                                <div className='flex gap-5 mb-5'>
                                    <div className='flex gap-2 items-center'>
                                        <span className='blog-card-icon'>{UserIcon}</span>
                                        <p className='mb-0 text-customOrange'>John Doe</p>
                                    </div>
                                    <div className='flex gap-2 items-center'>
                                        <span className='blog-card-icon'>{CalendarIcon}</span>
                                        <p className='mb-0 text-customOrange text-[14px]'>01 March 2025</p>
                                    </div>
                                </div>
                                <p className='mb-3 text-[16px]'>here are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text.</p>
                                <div className='p-10 bg-[#F2F6F7] my-7'>
                                    <p className='mb-0 text-center text-[20px] font-bold'>But in certain circumstances and owing to the claims of duty or the obligations of business it will frequently occur that pleasures have to be repudiated and annoyances accepted.</p>
                                </div>
                                <p className='mb-3 text-[16px]'>All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable.</p>
                                <p className='mb-3 text-[16px]'>The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.</p>
                                <div className='blog-sidecard py-3 mt-4 border-t border-[#eee]'>
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
                                <div className='flex justify-between'>
                                    <div>
                                        <a href='#'>
                                            <span className='block text-customOrange transition-all duration-300 hover:text-orange-700'>Prev</span>
                                            <span className='line-clamp-1 text-[20px] font-bold'>What It's Like Dating Organic Food</span>
                                        </a>
                                    </div>
                                    <div>
                                        <a href='#' className='inline-block text-right'>
                                            <span className='block text-customOrange transition-all duration-300 hover:text-orange-700'>Next</span>
                                            <span className='line-clamp-1 text-[20px] font-bold'>What It's Like Dating Organic Food</span>
                                        </a>
                                    </div>
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

export default SingleBlog
