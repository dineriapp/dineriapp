import React from 'react'
import { ContactCard } from './contact-card'
import { Clock, Mail, MessageCircle } from 'lucide-react'

const ContactInfo = () => {
    return (
        <section className="bg-white py-14 lg:py-24">
            <div className="max-w-[1200px] mx-auto px-4">
                <div className="mb-10 lg:mb-16 max-w-3xl mx-auto text-center">
                    <h2 className="mb-4 text-3xl font-bold bg-gradient-to-r from-[#2ECC71] to-[#002147] bg-clip-text text-transparent md:text-4xl lg:text-5xl">
                        Get in touch
                    </h2>
                    <p className="text-xl text-main-text">
                        Have questions? We&apos;re here to help
                    </p>
                </div>

                <div className="grid max-w-4xl mx-auto gap-3 lg:gap-8 md:grid-cols-3">
                    <ContactCard
                        icon={Mail}
                        title="Email Support"
                        description="support@dineri.app"
                        link="mailto:support@dineri.app"
                    />
                    <ContactCard
                        icon={MessageCircle}
                        title="WhatsApp"
                        description="Chat with us"
                        link="https://wa.me/message/support"
                    />
                    <ContactCard
                        icon={Clock}
                        title="Business Hours"
                        description="Mon-Fri, 9am-6pm CET"
                    />
                </div>
            </div>
        </section>
    )
}

export default ContactInfo
