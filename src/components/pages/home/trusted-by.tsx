"use client"
import { useTranslations } from 'next-intl';
import Image from 'next/image';

const TrustedBy = () => {
    const restaurantNames = [
        {
            text: "Trattoria Milano",
            img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSClTHTq4VaqRjti0orMjBnQU7A8udX9Mk_RQ&s",
        },
        {
            text: "Café Parisienne",
            img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTr2gUmVXGvPlJDLZTJuQ00WmVuJaWgPSYn3Q&s",
        },
        {
            text: "Spice Garden",
            img: "https://www.shutterstock.com/image-vector/modern-restaurant-logo-featuring-sleek-600nw-1656268684.jpg",
        },
        {
            text: "Ocean Grill",
            img: "https://i.pinimg.com/736x/8b/78/d4/8b78d4f191990af2dbedcf9c30480581.jpg",
        },
        {
            text: "Bistro Moderne",
            img: "https://d1csarkz8obe9u.cloudfront.net/posterpreviews/fast-food-restaurant-logo%2C-restaurant-logo-design-template-33255790cb8e1186b28609dd9afd4ee6_screen.jpg?ts=1668794604",
        },
        {
            text: "Golden Table",
            img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSt57nLtwpJmKHrrREIjNpagfPGjtY_onT4MbDKCFUX8QtbO-cPOhoWkFjFWLvvO2VC-vI&usqp=CAU",
        },
        {
            text: "La Petite Maison",
            img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTI-1QlPT7Mamp5hKauvHRNA2bk-hRFmdzBJtMUkRW-wvQUEoVpWoI52wqIGnzJLsra7Xs&usqp=CAU",
        },
        {
            text: "Sakura Sushi",
            img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4Dlb0N1QVUQrhF6wtNwDoacMmJvOBoOHy0HE_S71Ny-Oy1O8w6lna6ESdRNtXjoAlpeA&usqp=CAU",
        },
        {
            text: "Tandoori Flame",
            img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTr2gUmVXGvPlJDLZTJuQ00WmVuJaWgPSYn3Q&s",
        },
        {
            text: "Casa di Pasta",
            img: "https://i.pinimg.com/736x/8b/78/d4/8b78d4f191990af2dbedcf9c30480581.jpg",
        },
    ];
    const t = useTranslations("Home.Trusted");

    return (
        <section className=" bg-[#FFFFFF] border-[#D9D9D9] border py-10 sm:py-[72px] overflow-hidden">
            <div className="max-w-[1200px] mx-auto px-4">
                <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-[#62748E] ">
                    {t("text")}
                </p>

                {/* Marquee container */}
                <div className="relative w-full overflow-hidden">
                    <div
                        className="flex whitespace-nowrap gap-x-6 sm:gap-x-6"
                        style={{
                            animation: 'marquee 30s linear infinite',
                            display: 'flex',
                            width: 'max-content',
                        }}
                    >
                        {[...restaurantNames, ...restaurantNames].map((res, i) => (
                            <div key={i} className="flex items-center gap-2 text-slate-400 shrink-0 mr-10">
                                <Image src={res.img} alt={res.text} width={60} height={60} className='aspect-square border rounded-full w-full max-w-[42px] shrink-0' />
                                <span className="text-lg font-medium text-[#90A1B9]">{res.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Inline keyframes definition */}
            <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
        </section>
    );
};

export default TrustedBy;
