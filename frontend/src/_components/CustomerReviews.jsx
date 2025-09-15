import Image from 'next/image'
import React from 'react'
import PersonImg from '../../public/images/person-img.png';
import { QuoteRight } from '@/assets/Icons/Svg';

function CustomerReviews() {
    return (
        <section className='pt-10 pb-7'>
            <div>
                <h5 className="text-eyebrowColor font-semibold text-[20px] mb-7 text-center">
                    Testimonials
                </h5>
                <h4 className="uppercase text-4xl md:text-5xl font-bebas text-center mb-10">
                    <span className="text-customOrange font-bebas">Customers </span>
                    Feedbacks
                </h4>
                <div className='customer-sliders grid grid-cols-3 gap-4'>
                    <div className='customer-slide relative flex gap-4 bg-[#f2f6f7] p-8 items-center'>
                        <div className='flex-none'>
                            <Image src={PersonImg} className='customer-img w-[160px] h-[160px] object-cover' />
                        </div>
                        <div>
                            <h3 className='customer-name text-[24px] text-black mb-0'>Karlio Plet</h3>
                            <h4 className='customer-desg text-customOrange mb-3 text-[18px] font-bold'>CEO</h4>
                            <p className='customer-review text-black mb-0'>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
                        </div>
                        <span className='quote-right-icon'>
                            {QuoteRight}
                        </span>
                    </div>
                    <div className='customer-slide relative flex gap-4 bg-[#f2f6f7] p-8 items-center'>
                        <div className='flex-none'>
                            <Image src={PersonImg} className='customer-img w-[160px] h-[160px] object-cover' />
                        </div>
                        <div>
                            <h3 className='customer-name text-[24px] text-black mb-0'>Karlio Plet</h3>
                            <h4 className='customer-desg text-customOrange mb-3 text-[18px] font-bold'>CEO</h4>
                            <p className='customer-review text-black mb-0'>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
                        </div>
                        <span className='quote-right-icon'>
                            {QuoteRight}
                        </span>
                    </div>
                    <div className='customer-slide relative flex gap-4 bg-[#f2f6f7] p-8 items-center'>
                        <div className='flex-none'>
                            <Image src={PersonImg} className='customer-img w-[160px] h-[160px] object-cover' />
                        </div>
                        <div>
                            <h3 className='customer-name text-[24px] text-black mb-0'>Karlio Plet</h3>
                            <h4 className='customer-desg text-customOrange mb-3 text-[18px] font-bold'>CEO</h4>
                            <p className='customer-review text-black mb-0'>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
                        </div>
                        <span className='quote-right-icon'>
                            {QuoteRight}
                        </span>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default CustomerReviews
