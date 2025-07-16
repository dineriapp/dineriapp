import { TestimonialCard } from './testimonial-card'


const testimonials = [
    {
        name: "Marco Rossi",
        role: "Owner, Trattoria Milano",
        image: "https://media.licdn.com/dms/image/v2/D4E03AQHj7dWSR5ovJA/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1729369054465?e=2147483647&v=beta&t=yJ_cs3qCQOyfL5id1H9P0oAAlbUJFHPLjoWzLU6SUl8",
        content:
            "dineri.app transformed our online presence. Our customers love how easy it is to find our menu and make reservations. Highly recommended!",
        rating: 5,
    },
    {
        name: "Sophie Laurent",
        role: "Manager, Café Parisienne",
        image: "https://media.licdn.com/dms/image/v2/D4E03AQHj7dWSR5ovJA/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1729369054465?e=2147483647&v=beta&t=yJ_cs3qCQOyfL5id1H9P0oAAlbUJFHPLjoWzLU6SUl8",
        content:
            "Since using dineri.app, we've seen a 30% increase in online reservations. The platform is intuitive and our profile looks stunning.",
        rating: 5,
    },
    {
        name: "David Chen",
        role: "Owner, Spice Garden",
        image: "https://media.licdn.com/dms/image/v2/D4E03AQHj7dWSR5ovJA/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1729369054465?e=2147483647&v=beta&t=yJ_cs3qCQOyfL5id1H9P0oAAlbUJFHPLjoWzLU6SUl8",
        content:
            "The analytics feature has been invaluable for understanding our customers. Setting up our profile was quick and the support team is excellent.",
        rating: 4,
    },
]


const Testimonialssection = () => {
    return (
        <section className="bg-white py-14 lg:py-24">
            <div className="max-w-[1200px] mx-auto px-4">
                <div className="pb-10 lg:mb-16 max-w-3xl mx-auto text-center">
                    <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl lg:text-5xl">
                        Need <span className='bg-gradient-to-r from-[#2ECC71] to-[#002147] bg-clip-text text-transparent'>assistance?</span>
                    </h2>
                    <p className="text-lg text-slate-600">Whether it’s setup or support, just get in touch</p>
                </div>

                <div className="grid gap-4 lg:gap-8 md:grid-cols-3">
                    {testimonials.map((testimonial, index) => (
                        <TestimonialCard
                            key={index}
                            name={testimonial.name}
                            role={testimonial.role}
                            image={testimonial.image}
                            content={testimonial.content}
                            rating={testimonial.rating}
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Testimonialssection
