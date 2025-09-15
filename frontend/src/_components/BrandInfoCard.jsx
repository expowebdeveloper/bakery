import Image from 'next/image'
import React from 'react'
import PremiumQualityImage from '../../public/images/premium-quality.png'
import BakerySolutionImage from '../../public/images/bakery-solution.png'
import ReliableChainImage from '../../public/images/reliable-chain-supply.png'

function BrandInfoCard() {
    return (
        <section className='brands-cards-section py-12 relative'>
            <div className='container px-6 mx-auto'>
                <div className='inner-brands grid grid-cols-3 gap-6 pt-[150px] pb-[50px] bg-white'>
                    <div class="relative">
                        <div className='brand-card-icon'>
                            <Image src={PremiumQualityImage} />
                        </div>
                        <div>
                            <h3 className='font-bebas text-[32px] text-black text-center mb-4'>Premium Quality Standards</h3>
                            <p className='font-light text-[18px] text-[#515151] mb-0 text-center'>Emphasize the bakery’s commitment to maintaining the highest quality standards in all products. This could include quality control processes, certifications, and adherence to industry standards.</p>
                        </div>
                    </div>
                    <div class="relative">
                        <div className='brand-card-icon'>
                            <Image src={BakerySolutionImage} />
                        </div>
                        <div>
                            <h3 className='font-bebas text-[32px] text-black text-center mb-4'>Wholesale Baking Solutions</h3>
                            <p className='font-light text-[18px] text-[#515151] mb-0 text-center'>Highlight the bakery’s ability to provide large-scale, consistent, and high-quality baked goods to businesses. This could include supplying restaurants, cafes, hotels, and grocery stores.</p>
                        </div>
                    </div>
                    <div class="relative">
                        <div className='brand-card-icon'>
                            <Image src={ReliableChainImage} />
                        </div>
                        <div>
                            <h3 className='font-bebas text-[32px] text-black text-center mb-4'>Reliable Supply Chain & Delivery</h3>
                            <p className='font-light text-[18px] text-[#515151] mb-0 text-center'>Focus on the bakery’s commitment to reliability, timely deliveries, and maintaining a strong supply chain. This is crucial for businesses that depend on consistent inventory.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default BrandInfoCard
