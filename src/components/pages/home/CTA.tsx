import { LeftSideSVGImage, RightSideSVGImage } from '@/lib/svgs';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

const CTA = () => {
    const t = useTranslations("Home.CTA");

    return (
        <div className="w-full bg-[#EBE3CC] px-5 py-[188px] flex relative items-center justify-center flex-col overflow-hidden">
            <LeftSideSVGImage className="w-full max-w-[200px] sm:max-w-[300px] lg:max-w-[466px] h-auto absolute top-0 left-0 pointer-events-none" />
            <RightSideSVGImage className="w-full max-w-[300px] lg:max-w-[585px] h-auto absolute bottom-0 right-0 pointer-events-none" />
            <div className="w-full mx-auto max-w-[740px] gap-[46px] flex flex-col items-center justify-center">
                <h2
                    className="text-center text-[#002147] text-[60px] lg:text-[88px] font-[900] leading-[1.1]"
                    dangerouslySetInnerHTML={{ __html: t.raw("headline") }}
                />
                <Link href="/signup">
                    <button className="bg-[#009A5E] hover:bg-[#104e37] w-[232px] transition-all text-white font-poppins font-[600] cursor-pointer text-base px-[36px] h-[62px] rounded-full">
                        {t("cta")}
                    </button>
                </Link>
            </div>
        </div>
    );
};

export default CTA;
