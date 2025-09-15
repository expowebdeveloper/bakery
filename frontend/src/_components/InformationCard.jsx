import { deliveryIcon, qualityIcon, supportIcon } from '@/assets/Icons/Svg'
import React from 'react'

function InformationCard() {
    return (
        <section className='information-cards-section py-12'>
            <div className='container px-6 mx-auto'>
                <div className='inner-information grid grid-cols-3 gap-6 p-10 bg-white'>
                    <div className='flex items-center gap-4 lg:pe-6 lg:border-e'>
                        <div className='info-card-icon flex-none'>
                            {deliveryIcon}
                        </div>
                        <div>
                            <h3 className='font-bebas text-[24px] text-customOrange'>Free Home Delivery</h3>
                            <p className='font-light'>Provide free home delivery for all product over $100</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-4 lg:pe-6 lg:border-e'>
                        <div className='info-card-icon flex-none'>
                            {qualityIcon}
                        </div>
                        <div>
                            <h3 className='font-bebas text-[24px] text-customOrange'>Quality Products</h3>
                            <p className='font-light'>We ensure the product quality that is our main goal</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-4'>
                        <div className='info-card-icon flex-none'>
                            {supportIcon}
                        </div>
                        <div>
                            <h3 className='font-bebas text-[24px] text-customOrange'>Online Support</h3>
                            <p className='font-light'>We ensure the product quality that you can trust easily</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default InformationCard
