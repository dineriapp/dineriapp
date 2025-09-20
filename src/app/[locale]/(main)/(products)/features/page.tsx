import { useTranslations } from 'next-intl';
import Image from 'next/image';

const Page = () => {
    const t = useTranslations('FeaturesPage.Hero');

    return (
        <div className='w-full bg-[white] flex items-center justify-center gap-7 sm:gap-[50px] flex-col pt-32 sm:pt-40 px-5 pb-12'>
            {/* top  */}
            <div className='w-full max-w-[1200px] '>
                <h1 className="mb-3 text-[44px] font-bold text-center leading-[1.05] tracking-tight text-[#1B4048] md:text-6xl lg:text-6xl ">
                    <span
                        dangerouslySetInnerHTML={{
                            __html: t.raw('title')
                        }}
                        className="bg-gradient-to-r from-[#1B4048] to-[#1B4048] bg-clip-text text-transparent">
                    </span>
                </h1>
                <p className="text-center text-lg md:text-xl text-gray-600 max-w-[800px] mx-auto leading-relaxed">
                    {t('description')}
                </p>
            </div>
            {/* bottom  */}
            <div className='w-full lg:max-w-[1200px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'>
                {/* 1  */}
                <div className='bg-[#DFE9B7] rounded-[20px] p-5 sm:p-8 w-full h-full'>
                    <div className='flex items-center justify-center'>
                        <Image src={"/img-f-1.avif"} alt='img-f-1.avif' width={300} height={300} className='w-full max-w-[300px]' />
                    </div>
                    <h2 className='text-black text-3xl font-montserrat !leading-[1.1] font-semibold mt-5'>
                        {t('features.1.title')}
                    </h2>
                    <p className='text-black text-base font-montserrat mt-2'>
                        {t('features.1.text')}
                    </p>
                </div>
                {/* 2  */}
                <div className='bg-[#002147] rounded-[20px] p-5 sm:p-8 w-full h-full'>
                    <div className='flex items-center justify-center'>
                        <Image src={"/img-f-2.avif"} alt='img-f-2.avif' width={300} height={300} className='w-full max-w-[300px]' />
                    </div>
                    <h2 className='text-white text-3xl font-montserrat !leading-[1.1] font-semibold mt-5'>
                        {t('features.2.title')}
                    </h2>
                    <p className='text-white text-base font-montserrat mt-2'>
                        {t('features.2.text')}
                    </p>
                </div>
                {/* 3  */}
                <div className='bg-[#EBE3CC] rounded-[20px] p-5 sm:p-8 w-full h-full'>
                    <div className='flex items-center justify-center'>
                        <Image src={"/img-f-3.avif"} alt='img-f-3.avif' width={300} height={300} className='w-full max-w-[300px]' />
                    </div>
                    <h2 className='text-black text-3xl font-montserrat !leading-[1.1] font-semibold mt-5'>
                        {t('features.3.title')}
                    </h2>
                    <p className='text-black text-base font-montserrat mt-2'>
                        {t('features.3.text')}
                    </p>
                </div>
                {/* 4  */}
                <div className='bg-[#1e2330] rounded-[20px] p-5 sm:p-8 w-full h-full'>
                    <div className='flex items-center justify-center'>
                        <Image src={"/img-f-2.avif"} alt='img-f-2.avif' width={300} height={300} className='w-full max-w-[300px]' />
                    </div>
                    <h2 className='text-white text-3xl font-montserrat !leading-[1.1] font-semibold mt-5'>
                        {t('features.4.title')}
                    </h2>
                    <p className='text-white text-base font-montserrat mt-2'>
                        {t('features.4.text')}
                    </p>
                </div>
                {/* 5  */}
                <div className='bg-[#cc01dd] rounded-[20px] p-5 sm:p-8 w-full h-full'>
                    <div className='flex items-center justify-center'>
                        <Image src={"/img-f-3.avif"} alt='img-f-3.avif' width={300} height={300} className='w-full max-w-[300px]' />
                    </div>
                    <h2 className='text-white text-3xl font-montserrat !leading-[1.1] font-semibold mt-5'>
                        {t('features.5.title')}
                    </h2>
                    <p className='text-white text-base font-montserrat mt-2'>
                        {t('features.5.text')}
                    </p>
                </div>

                {/* 6  */}
                <div className='bg-[#061492] rounded-[20px] p-5 sm:p-8 w-full h-full'>
                    <div className='flex items-center justify-center'>
                        <Image src={"/img-f-1.avif"} alt='img-f-1.avif' width={300} height={300} className='w-full max-w-[300px]' />
                    </div>
                    <h2 className='text-white text-3xl font-montserrat !leading-[1.1] font-semibold mt-5'>
                        {t('features.6.title')}
                    </h2>
                    <p className='text-white text-base font-montserrat mt-2'>
                        {t('features.6.text')}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Page
