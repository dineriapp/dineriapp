"use client";

import { Separator } from "@/components/ui/separator";
import { useTranslations } from "next-intl";
import Link from "next/link";

export default function FeaturesPage() {
    const a = useTranslations("HelpCenter.Features.Analytics")
    const o = useTranslations("HelpCenter.Features.Orders")
    const l = useTranslations("HelpCenter.Features.Links")
    return (
        <div className="px-6 py-8 md:py-16 w-full flex justify-center">
            <div className="max-w-5xl w-full">
                <div id="analytics" className="scroll-mt-32">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-main-blue">
                        {a("pageTitle")}
                    </h1>
                    <p className="text-lg text-muted-foreground mb-4">
                        {a("intro")}
                    </p>
                    <h1 className="text-xl md:text-2xl font-semibold tracking-tight mb-4 text-main-blue">
                        {a("overviewTitle")}
                    </h1>
                    <p className="text-lg text-muted-foreground mb-4">
                        {a("overviewText")}
                    </p>
                    <Separator className="my-12" />
                    <section >
                        <h3 className="flex items-center gap-2 text-2xl font-bold mb-4 text-slate-800">
                            {a("metricsTitle")}
                        </h3>
                        <ul className="space-y-4 list-disc list-outside mb-10 pl-5">
                            <li className="">
                                <p className="text-slate-700">
                                    <span className="font-semibold">{a("metrics.totalLinkViews.title")} –</span>{" "}
                                    {a("metrics.totalLinkViews.description")}
                                </p>
                            </li>
                            <li className="">
                                <p className="text-slate-700">
                                    <span className="font-semibold">{a("metrics.uniqueLinkVisitors.title")} –</span>{" "}
                                    {a("metrics.uniqueLinkVisitors.description")}
                                </p>
                            </li>
                            <li className="">
                                <p className="text-slate-700">
                                    <span className="font-semibold">{a("metrics.pageViews.title")} –</span>{" "}
                                    {a("metrics.pageViews.description")}
                                </p>
                            </li>
                            <li className="">
                                <p className="text-slate-700">
                                    <span className="font-semibold">{a("metrics.uniquePageVisitors.title")} –</span>{" "}
                                    {a("metrics.uniquePageVisitors.description")}
                                </p>
                            </li>
                        </ul>
                    </section>
                    <section >
                        <h3 className="flex items-center gap-2 text-2xl font-bold mb-4 text-slate-800">
                            {a("benefitsTitle")}
                        </h3>
                        <ul className="space-y-4 list-disc list-outside mb-10 pl-5">
                            {
                                a.raw("benefits")?.map((item: string, idx: number) => (

                                    <li key={`benifit-${idx}`} className="">
                                        <p className="text-slate-700">
                                            {item}
                                        </p>
                                    </li>
                                ))
                            }
                        </ul>
                    </section>
                    <section >
                        <h3 className="flex items-center gap-2 text-2xl font-bold mb-4 text-slate-800">
                            {a("tipsTitle")}
                        </h3>
                        <ul className="space-y-4 list-disc list-outside mb-10 pl-5">
                            {
                                a.raw("tips")?.map((item: string, idx: number) => (

                                    <li key={`tips-${idx}`} className="">
                                        <p className="text-slate-700">
                                            {item}
                                        </p>
                                    </li>
                                ))
                            }
                        </ul>
                    </section>
                </div>
                <Separator className="my-12" />
                <div id="orders" className="scroll-mt-26">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-8 text-main-blue">
                        {o("pageTitle")}
                    </h1>
                    <section>
                        <h3 className="flex items-center gap-2 text-2xl font-bold mb-4 text-slate-800">
                            {o("accessShopTitle")}
                        </h3>
                        <ul className="space-y-4 list-disc list-outside mb-10 pl-5">
                            {o.raw("accessShop")?.map((item: string, idx: number) => (
                                <li key={`shop-${idx}`} className="">
                                    <p dangerouslySetInnerHTML={{
                                        __html: item
                                    }} className="text-slate-700">
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </section>
                    <section>
                        <h3 className="flex items-center gap-2 text-2xl font-bold mb-4 text-slate-800">
                            {o("addProductsTitle")}
                        </h3>
                        <ul className="space-y-4 list-disc list-outside mb-10 pl-5">
                            {o.raw("addProducts")?.map((item: string, idx: number) => (
                                <li key={`addProducts-${idx}`} className="">
                                    <p dangerouslySetInnerHTML={{
                                        __html: item
                                    }} className="text-slate-700">
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </section>
                    <section>
                        <h3 className="flex items-center gap-2 text-2xl font-bold mb-4 text-slate-800">
                            {o("manageOrdersTitle")}
                        </h3>
                        <ul className="space-y-4 list-disc list-outside mb-10 pl-5">
                            {o.raw("manageOrders")?.map(
                                (
                                    item: string | { title: string, items: string[] },
                                    index: number
                                ) => (
                                    typeof item === "string" ? (
                                        <li key={index * 3432} className="">
                                            <p
                                                dangerouslySetInnerHTML={{ __html: item }}
                                                className="text-slate-700">
                                            </p>
                                        </li>
                                    ) : (
                                        <li key={index * 22} className="">
                                            <p className="text-slate-700">
                                                {item.title}
                                            </p>
                                            <ul className="space-y-4 list-disc mt-3 list-outside mb-10 pl-5">
                                                {
                                                    item.items.map((im, id) => {
                                                        return <li key={id * 9} className="">
                                                            <p
                                                                dangerouslySetInnerHTML={{ __html: im }}
                                                                className="text-slate-700">

                                                            </p>
                                                        </li>
                                                    })
                                                }
                                            </ul>
                                        </li>
                                    )
                                ))}
                        </ul>
                    </section>
                    <section>
                        <h3 className="flex items-center gap-2 text-2xl font-bold mb-4 text-slate-800">
                            {o("dashboardFunctionsTitle")}
                        </h3>
                        <ul className="space-y-4 list-disc list-outside mb-10 pl-5">
                            {o.raw("dashboardFunctions").map((item: string, idx: number) => (
                                <li key={`dashboardFunctions=${idx}`} className="">
                                    <p
                                        dangerouslySetInnerHTML={{ __html: item }}
                                        className="text-slate-700">
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </section>
                    <section >
                        <h3 className="flex items-center gap-2 text-2xl font-bold mb-4 text-slate-800">
                            {o("benefitsTitle")}
                        </h3>
                        <ul className="space-y-4 list-disc list-outside mb-10 pl-5">
                            {o.raw("benefits").map((item: string, idx: number) => (
                                <li key={`benefits=${idx}`} className="">
                                    <p
                                        dangerouslySetInnerHTML={{ __html: item }}
                                        className="text-slate-700">
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </section>
                    <section >
                        <h3 className="flex items-center gap-2 text-2xl font-bold mb-4 text-slate-800">
                            {o("tipsTitle")}
                        </h3>
                        <ul className="space-y-4 list-disc list-outside mb-10 pl-5">
                            {o.raw("tips").map((item: string, idx: number) => (
                                <li key={`tips-231=${idx}`} className="">
                                    <p
                                        dangerouslySetInnerHTML={{ __html: item }}
                                        className="text-slate-700">
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </section>
                    <section >
                        <h3 className="flex items-center gap-2 text-2xl font-bold mb-4 text-slate-800">
                            {o("paymentsTitle")}
                        </h3>
                        <p
                            dangerouslySetInnerHTML={{ __html: o.raw("payments") }}
                            className="text-slate-700">
                        </p>
                    </section>
                </div>
                <Separator className="my-12" />
                <div id="links" className="scroll-mt-26">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-main-blue">
                        {l("title")}
                    </h1>
                    <p className="text-lg text-muted-foreground mb-4">
                        {l("intro")}
                    </p>
                    <h1 className="text-xl md:text-2xl font-semibold tracking-tight mb-4 text-main-blue">
                        {l("overviewTitle")}
                    </h1>
                    <p className="text-lg text-muted-foreground mb-4">
                        {l("overviewText")}
                    </p>
                    <Separator className="my-12" />
                    <section>
                        <h3 className="flex items-center gap-2 text-2xl font-bold mb-4 text-slate-800">
                            {l("howItWorksTitle")}
                        </h3>
                        <ul className="space-y-4 list-disc list-outside mb-10 pl-5">
                            {l.raw("howItWorks")?.map(
                                (
                                    item: string | { title: string, items: string[] },
                                    index: number
                                ) => (
                                    typeof item === "string" ? (
                                        <li key={index * 3432} className="">
                                            <p
                                                dangerouslySetInnerHTML={{ __html: item }}
                                                className="text-slate-700">
                                            </p>
                                        </li>
                                    ) : (
                                        <li key={index * 22} className="">
                                            <p className="text-slate-700">
                                                {item.title}
                                            </p>
                                            <ul className="space-y-4 list-disc mt-3 list-outside mb-10 pl-5">
                                                {
                                                    item.items.map((im, id) => {
                                                        return <li key={id * 9} className="">
                                                            <p
                                                                dangerouslySetInnerHTML={{ __html: im }}
                                                                className="text-slate-700">

                                                            </p>
                                                        </li>
                                                    })
                                                }
                                            </ul>
                                        </li>
                                    )
                                ))}
                        </ul>
                    </section>
                    <section>
                        <h3 className="flex items-center gap-2 text-2xl font-bold mb-4 text-slate-800">
                            {l("benefitsTitle")}
                        </h3>
                        <ul className="space-y-4 list-disc list-outside mb-10 pl-5">
                            {l.raw("benefits")?.map((item: string, idx: number) => (
                                <li key={`benefits-${idx}`} className="">
                                    <p
                                        dangerouslySetInnerHTML={{
                                            __html: item
                                        }}
                                        className="text-slate-700">
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </section>
                    <section>
                        <h3 className="flex items-center gap-2 text-2xl font-bold mb-4 text-slate-800">
                            {l("tipsTitle")}
                        </h3>
                        <ul className="space-y-4 list-disc list-outside mb-10 pl-5">
                            {l.raw("tips")?.map((item: string, idx: number) => (
                                <li key={`tips-2323-${idx}`} className="">
                                    <p
                                        dangerouslySetInnerHTML={{
                                            __html: item
                                        }}
                                        className="text-slate-700">
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>
                {/* d  */}
                <Separator className="my-12" />
                <div id="menu" className="scroll-mt-26">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-main-blue">
                        Menu
                    </h1>
                    <p className="text-lg text-muted-foreground mb-4">
                        Create and customize your digital menu with item descriptions, pricing, and categories. Use
                        it as a simple <b>Quick Menu</b> for instant sharing, or connect it directly to your <b>order system</b> for
                        a complete digital shop experience.
                    </p>
                    <h1 className="text-xl md:text-2xl font-semibold tracking-tight mb-4 text-main-blue">
                        Overview
                    </h1>
                    <p className="text-lg text-muted-foreground mb-4">
                        The Menu feature is the foundation of your Dineri setup. It allows you to build a structured,
                        professional menu that’s always up to date. Guests can browse your dishes online, and if
                        you have the order system enabled, they can also place orders directly through your shop.
                    </p>
                    <Separator className="my-12" />
                    <section>
                        <h3 className="flex items-center gap-2 text-2xl font-bold mb-4 text-slate-800">
                            How it works
                        </h3>
                        <ul className="space-y-4 list-none list-outside mb-10">
                            <li className="">
                                <p className="text-slate-700">
                                    <b>1. Create categories</b>
                                </p>
                                <ul className="space-y-4 mt-3 list-disc list-outside mb-10 pl-10">
                                    <li className="">
                                        <p className="text-slate-700">
                                            Organize your items into categories (e.g. Starters, Main Courses, Drinks).
                                        </p>
                                    </li>
                                    <li className="">
                                        <p className="text-slate-700">
                                            Choose whether a category should be <b>enabled in the Quick</b> Menu or not.
                                        </p>
                                    </li>
                                    <li className="">
                                        <p className="text-slate-700">
                                            Categories disabled for the Quick Menu will still appear in your Shop
                                            (connected to Orders).
                                        </p>
                                    </li>
                                </ul>
                            </li>
                            <li className="">
                                <p className="text-slate-700">
                                    <b>2. Add products</b>
                                </p>
                                <ul className="space-y-4 mt-3 list-disc list-outside mb-10 pl-10">
                                    <li className="">
                                        <p className="text-slate-700">
                                            Go to your dashboard → <b>Menu</b> → <b>Add Product.</b>
                                        </p>
                                    </li>
                                    <li className="">
                                        <p className="text-slate-700">
                                            Fill in the product <b>name</b>, <b>description</b>, and <b>price</b>.
                                        </p>
                                    </li>
                                    <li className="">
                                        <p className="text-slate-700">
                                            Assign the product to the correct category.
                                        </p>
                                    </li>
                                    <li className="">
                                        <p className="text-slate-700">
                                            <b>Note:</b> Images are not supported at this time.
                                        </p>
                                    </li>
                                </ul>
                            </li>
                            <li className="">
                                <p className="text-slate-700">
                                    <b>3. Allergies & Add-ons</b>
                                </p>
                                <ul className="space-y-4 mt-3 list-disc list-outside mb-10 pl-10">
                                    <li className="">
                                        <p className="text-slate-700">
                                            For each product, you can specify <b>allergens</b> (e.g. nuts, gluten, dairy).
                                        </p>
                                    </li>
                                    <li className="">
                                        <p className="text-slate-700">
                                            Add optional <b>add-ons</b> (e.g. “Extra Cheese” or “Add Sauce”).
                                        </p>
                                    </li>
                                    <li className="">
                                        <p className="text-slate-700">
                                            Important: Add-ons are <b>not visible in the Quick Menu</b> — they only appear in
                                            the <b>Shop</b> when guests are placing an order.
                                        </p>
                                    </li>
                                </ul>
                            </li>
                            <li className="">
                                <p className="text-slate-700">
                                    <b>4. Save & publish</b>
                                </p>
                                <ul className="space-y-4 mt-3 list-disc list-outside mb-10 pl-10">
                                    <li className="">
                                        <p className="text-slate-700">
                                            Your menu is updated instantly across all channels: Quick Menu, Shop, QR
                                            codes, and links.
                                        </p>
                                    </li>
                                    <li className="">
                                        <p className="text-slate-700">
                                            Add optional <b>add-ons</b> (e.g. “Extra Cheese” or “Add Sauce”).
                                        </p>
                                    </li>
                                    <li className="">
                                        <p className="text-slate-700">
                                            Important: Add-ons are <b>not visible in the Quick Menu</b> — they only appear in
                                            the <b>Shop</b> when guests are placing an order.
                                        </p>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </section>
                    <section>
                        <h3 className="flex items-center gap-2 text-2xl font-bold mb-4 text-slate-800">
                            Key Benefits
                        </h3>
                        <ul className="space-y-4 list-disc list-outside mb-10 pl-5">
                            <li className="">
                                <p className="text-slate-700">
                                    <b>Structured menus –</b> Organize items with categories for easy navigation.
                                </p>
                            </li>
                            <li className="">
                                <p className="text-slate-700">
                                    <b>Quick Menu vs. Shop –</b> Share a lightweight standalone menu or a fully integrated
                                    order shop.                                </p>
                            </li>
                            <li className="">
                                <p className="text-slate-700">
                                    <b>Allergen details –</b> Help guests make informed choices.                                </p>
                            </li>
                            <li className="">
                                <p className="text-slate-700">
                                    <b>Flexible add-ons –</b> Offer customization (e.g. toppings, extras) to increase order
                                    value.
                                </p>
                            </li>
                            <li className="">
                                <p className="text-slate-700">
                                    <b>Real-time updates –</b> Any changes are instantly reflected everywhere.
                                </p>
                            </li>
                        </ul>
                    </section>
                    <section>
                        <h3 className="flex items-center gap-2 text-2xl font-bold mb-4 text-slate-800">
                            Tips
                        </h3>
                        <ul className="space-y-4 list-disc list-outside mb-10 pl-5">
                            <li className="">
                                <p className="text-slate-700">
                                    Create categories before adding items, it keeps your menu tidy.
                                </p>
                            </li>
                            <li className="">
                                <p className="text-slate-700">
                                    Enable only the most relevant categories for the <b>Quick Menu</b> (e.g. Drinks, Food),
                                    and keep others exclusive to your Shop.
                                </p>
                            </li>
                            <li className="">
                                <p className="text-slate-700">
                                    Keep descriptions clear and simple, too much text makes the menu harder to read.
                                </p>
                            </li>
                            <li className="">
                                <p className="text-slate-700">
                                    Use add-ons wisely: extras like toppings or sauces can boost upsells.
                                </p>
                            </li>
                            <li className="">
                                <p className="text-slate-700">
                                    Regularly review allergen info to stay accurate and compliant.
                                </p>
                            </li>
                        </ul>
                    </section>
                </div>
                <Separator className="my-12" />
                <div id="events" className="scroll-mt-26">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-main-blue">
                        Events
                    </h1>
                    <p className="text-lg text-muted-foreground mb-4">
                        Announce and promote special events directly to your guests. Whether it’s a live music
                        night, a holiday dinner, or a private tasting, you can share all the details in one place.
                    </p>
                    <h1 className="text-xl md:text-2xl font-semibold tracking-tight mb-4 text-main-blue">
                        Overview
                    </h1>
                    <p className="text-lg text-muted-foreground mb-4">
                        The Events feature helps you engage your audience by showcasing upcoming activities at
                        your restaurant, bar, or venue. Guests can see what’s happening, when it’s happening, and
                        how to join, all from your digital profile.
                    </p>
                    <p className="text-lg  mb-4 text-black bg-green-100 w-fit p-4 rounded-xl">
                        <b className="text-black">Note</b>: Events are available on all plans. With a paid plan, you can create <b className="text-black">unlimited events</b>.
                    </p>
                    <Separator className="my-12" />
                    <section>
                        <h3 className="flex items-center gap-2 text-2xl font-bold mb-4 text-slate-800">
                            How it works
                        </h3>
                        <ul className="space-y-4 list-none list-outside mb-10">
                            <li className="">
                                <p className="text-slate-700">
                                    1. Navigate to the <b>Events</b> section.
                                </p>
                            </li>
                            <li className="">
                                <p className="text-slate-700">
                                    2. Click <b>Add Event</b> and enter the details:
                                </p>
                                <ul className="space-y-4 mt-3 list-disc list-outside mb-10 pl-10">
                                    <li className="">
                                        <p className="text-slate-700">
                                            <b>Event title</b>
                                        </p>
                                    </li>
                                    <li className="">
                                        <p className="text-slate-700">
                                            <b>Description</b> (e.g. program, performers, or menu highlights)
                                        </p>
                                    </li>
                                    <li className="">
                                        <p className="text-slate-700">
                                            <b>Date & time</b>
                                        </p>
                                    </li>
                                    <li className="">
                                        <p className="text-slate-700">
                                            <b>Location</b> (if different from your main venue)
                                        </p>
                                    </li>
                                </ul>
                            </li>
                            <li className="">
                                <p className="text-slate-700">
                                    3. Save → The event is automatically displayed on your <b>profile page</b>.
                                </p>
                            </li>
                            <li className="">
                                <p className="text-slate-700">
                                    4. A new <b>Events link</b> is added to your profile navigation so guests can easily find all
                                    upcoming activities.
                                </p>
                            </li>
                            <li className="">
                                <p className="text-slate-700">
                                    5. You can edit or remove events at any time and changes are reflected instantly.
                                </p>
                            </li>
                        </ul>
                    </section>
                    <section>
                        <h3 className="flex items-center gap-2 text-2xl font-bold mb-4 text-slate-800">
                            Key Benefits
                        </h3>
                        <ul className="space-y-4 list-disc list-outside mb-10 pl-5">
                            <li className="">
                                <p className="text-slate-700">
                                    <b>Promote your business –</b> Highlight special nights, offers, or seasonal activities.
                                </p>
                            </li>
                            <li className="">
                                <p className="text-slate-700">
                                    <b>Unlimited events –</b> Add as many events as you like (paid plans only).
                                </p>
                            </li>
                            <li className="">
                                <p className="text-slate-700">
                                    <b>Automatic visibility –</b> Events are instantly added to your profile and shown under a
                                    dedicated “Events” link.
                                </p>
                            </li>
                            <li className="">
                                <p className="text-slate-700">
                                    <b>Integrated marketing –</b> Combine with popups to announce your events in real-time.
                                </p>
                            </li>
                        </ul>
                    </section>
                    <section>
                        <h3 className="flex items-center gap-2 text-2xl font-bold mb-4 text-slate-800">
                            Integration with Popups
                        </h3>
                        <p className="text-lg text-muted-foreground mb-4">
                            In addition to showing events on your profile, you can also display them in a popup when
                            visitors land on your page.
                        </p>
                        <ul className="space-y-4 list-disc list-outside mb-10 pl-5">
                            <li className="">
                                <p className="text-slate-700">
                                    This is a great way to instantly grab attention.
                                </p>
                            </li>
                            <li className="">
                                <p className="text-slate-700">
                                    To configure this, see the <Link href={"/help-center/features#popups"} className="underline text-blue-500">Popups Guide</Link> in the Help Center.
                                </p>
                            </li>
                        </ul>
                    </section>
                    <section>
                        <h3 className="flex items-center gap-2 text-2xl font-bold mb-4 text-slate-800">
                            Tips
                        </h3>
                        <ul className="space-y-4 list-disc list-outside mb-10 pl-5">
                            <li className="">
                                <p className="text-slate-700">
                                    Add engaging descriptions (e.g. “Live DJ + cocktail specials”) to capture attention.
                                </p>
                            </li>
                            <li className="">
                                <p className="text-slate-700">
                                    Use a <b>QR code</b> specifically for your event page and place it on flyers, posters, or
                                    tables.
                                </p>
                            </li>
                            <li className="">
                                <p className="text-slate-700">
                                    Keep past events archived or remove them quickly to keep your profile fresh.
                                </p>
                            </li>
                            <li className="">
                                <p className="text-slate-700">
                                    Combine events with <b>popups</b> for maximum visibility.
                                </p>
                            </li>
                        </ul>
                    </section>
                </div>
                <Separator className="my-12" />
                <div id="faq" className="scroll-mt-26">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-main-blue">
                        FAQ
                    </h1>
                    <p className="text-lg text-muted-foreground mb-4">
                        Add frequently asked questions to your profile so guests can quickly find answers without
                        contacting you directly.
                    </p>
                    <h1 className="text-xl md:text-2xl font-semibold tracking-tight mb-4 text-main-blue">
                        Overview
                    </h1>
                    <p className="text-lg text-muted-foreground mb-4">
                        The FAQ feature allows you to create a list of common questions and answers about your
                        restaurant, services, or policies. This saves time for both you and your guests, while
                        providing a better experience.
                    </p>
                    <p className="text-lg  mb-6 text-black bg-green-100 w-fit p-4 rounded-xl">
                        You can either use the <b>Quick Setup Tool</b> (with pre-written FAQs you only need to adjust
                        slightly), or write your own questions and answers from scratch.

                    </p>
                    <section>
                        <h3 className="flex items-center gap-2 text-2xl font-bold mb-4 text-slate-800">
                            How it works
                        </h3>
                        <ul className="space-y-4 list-none list-outside mb-10">
                            <li className="">
                                <p className="text-slate-700">
                                    1. Choose one of two options:
                                </p>
                                <ul className="space-y-4 mt-3 list-disc list-outside mb-10 pl-10">
                                    <li className="">
                                        <p className="text-slate-700">
                                            <b>Quick Setup</b> → Select from a set of pre-written questions (e.g. opening
                                            hours, payment methods, dietary options) and make small edits to fit your
                                            business.
                                        </p>
                                    </li>
                                    <li className="">
                                        <p className="text-slate-700">
                                            <b>Manual Setup</b> → Write your own questions and answers one by one.
                                        </p>
                                    </li>
                                </ul>
                            </li>
                            <li className="">
                                <p className="text-slate-700">
                                    2. Save → The FAQ is automatically displayed on your profile page under a dedicated
                                    “FAQ” section.
                                </p>
                            </li>
                            <li className="">
                                <p className="text-slate-700">
                                    3. You can edit or remove questions at any time.
                                </p>
                            </li>
                        </ul>
                    </section>
                    <section>
                        <h3 className="flex items-center gap-2 text-2xl font-bold mb-4 text-slate-800">
                            Key Benefits
                        </h3>
                        <ul className="space-y-4 list-disc list-outside mb-10 pl-5">
                            <li className="">
                                <p className="text-slate-700">
                                    <b>Save time –</b> Pre-written FAQs get you started in minutes.
                                </p>
                            </li>
                            <li className="">
                                <p className="text-slate-700">
                                    <b>Reduce repetitive questions –</b> Guests can find answers instantly.
                                </p>
                            </li>
                            <li className="">
                                <p className="text-slate-700">
                                    <b>Flexible setup –</b> Quick setup for speed, manual setup for full control.
                                </p>
                            </li>
                            <li className="">
                                <p className="text-slate-700">
                                    <b>Better customer experience –</b> Guests feel informed and confident.
                                </p>
                            </li>
                        </ul>
                    </section>
                    <section>
                        <h3 className="flex items-center gap-2 text-2xl font-bold mb-4 text-slate-800">
                            Tips
                        </h3>
                        <ul className="space-y-4 list-disc list-outside mb-10 pl-5">
                            <li className="">
                                <p className="text-slate-700">
                                    If you’re just getting started, use the <b>Quick Setup Tool</b> to get a FAQ live fast.
                                </p>
                            </li>
                            <li className="">
                                <p className="text-slate-700">
                                    Keep answers short, clear, and easy to read.
                                </p>
                            </li>
                            <li className="">
                                <p className="text-slate-700">
                                    Cover the basics first: opening hours, allergens, delivery & pickup options, payment
                                    methods.
                                </p>
                            </li>
                            <li className="">
                                <p className="text-slate-700">
                                    Update your FAQ whenever your menu, policies, or events change.
                                </p>
                            </li>
                        </ul>
                    </section>
                </div>
                <Separator className="my-12" />
                <div id="popups" className="scroll-mt-26">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-main-blue">
                        Popups
                    </h1>
                    <p className="text-lg text-muted-foreground mb-4">
                        <b className="text-black">Popups –</b> Create simple, customizable popups to capture your guests’ attention. Use them
                        to make announcements, promote events, or welcome visitors to your page.
                    </p>
                    <h1 className="text-xl md:text-2xl font-semibold tracking-tight mb-4 text-main-blue">
                        Overview
                    </h1>
                    <p className="text-lg text-muted-foreground mb-4">
                        The Popups feature allows you to highlight important information the moment a guest visits
                        your profile or ordering page. Popups are a flexible communication tool — perfect for
                        temporary promotions, urgent announcements, or simply welcoming visitors. Unlike static
                        content, a popup ensures your message won’t be missed.
                    </p>
                    <p className="text-lg  mb-6 text-black bg-green-100 w-fit p-4 rounded-xl">
                        Popups can also be connected to your <b>Events feature</b>, so upcoming events can
                        automatically be displayed in a popup window.
                    </p>
                    <section>
                        <h3 className="flex items-center gap-2 text-2xl font-bold mb-4 text-slate-800">
                            Popup Types
                        </h3>
                        <p className="text-lg text-muted-foreground mb-4">
                            There are <b className="text-black">three popup options</b>, which can be enabled or disabled individually — or even
                            combined:
                        </p>
                        <ul className="space-y-4 list-disc list-outside mb-6 pl-5">
                            <li className="">
                                <p className="text-slate-700">
                                    <b>Homepage Popup –</b> Display an announcement when a visitor opens your main
                                    profile page.
                                </p>
                            </li>
                            <li className="">
                                <p className="text-slate-700">
                                    <b>Restaurant Page Popup –</b> Show messages directly on your food ordering page.
                                </p>
                            </li>
                            <li className="">
                                <p className="text-slate-700">
                                    <b>Events Popup –</b> Highlight your upcoming events in a popup.
                                </p>
                            </li>
                        </ul>
                        <p className="text-lg mb-6 text-black bg-green-100 w-fit p-4 rounded-xl">
                            💡 The Events Popup can be combined with the Homepage Popup. In that case, your
                            general message will appear <b>together with event announcements</b>. You can also choose to
                            disable one of them if you prefer to keep it simple.
                        </p>
                    </section>
                    <section>
                        <h3 className="flex items-center gap-2 text-2xl font-bold mb-4 text-slate-800">
                            How it works
                        </h3>
                        <ul className="space-y-4 list-none list-outside mb-10">
                            <li className="">
                                <p className="text-slate-700">
                                    1. Go to the Popups section.
                                </p>
                            </li>
                            <li className="">
                                <p className="text-slate-700">
                                    2. Create a popup and configure the following settings:
                                </p>
                                <ul className="space-y-4 mt-3 list-disc list-outside mb-10 pl-10">
                                    <li className="">
                                        <p className="text-slate-700">
                                            <b>Title</b> – A short headline for your popup.
                                        </p>
                                    </li>
                                    <li className="">
                                        <p className="text-slate-700">
                                            <b>Message –</b> The content you want to display.
                                        </p>
                                    </li>
                                    <li className="">
                                        <p className="text-slate-700">
                                            <b>Popup type –</b> Choose homepage, restaurant page, events, or a combination.
                                        </p>
                                    </li>
                                    <li className="">
                                        <p className="text-slate-700">
                                            <b>Delay function –</b> Set how many seconds after page load the popup should
                                            appear.
                                        </p>
                                    </li>
                                    <li className="">
                                        <p className="text-slate-700">
                                            <b>Show Action (Explore) button –</b> Toggle this on/off. When enabled, visitors
                                            can click “Explore” to close the popup and continue to your page.
                                        </p>
                                    </li>
                                    <li className="">
                                        <p className="text-slate-700">
                                            <b>Event options</b> (if using Event Popups):
                                        </p>
                                        <ul className="space-y-4 mt-3 list-disc list-outside mb-10 pl-10">
                                            <li className="">
                                                <p className="text-slate-700">
                                                    <b>Event time range –</b> Select which events should be shown.
                                                </p>
                                            </li>
                                            <li className="">
                                                <p className="text-slate-700">
                                                    <b>Maximum events in popup –</b> Limit how many events are displayed.
                                                </p>
                                            </li>
                                            <li className="">
                                                <p className="text-slate-700">
                                                    <b>Event rotation speed –</b> Control how fast events rotate inside the
                                                    popup.
                                                </p>
                                            </li>
                                        </ul>
                                    </li>
                                </ul>
                            </li>
                            <li className="">
                                <p className="text-slate-700">
                                    3. Save → Your popup is instantly live and visible to visitors.
                                </p>
                            </li>
                        </ul>
                    </section>
                    <section>
                        <h3 className="flex items-center gap-2 text-2xl font-bold mb-4 text-slate-800">
                            Use cases
                        </h3>
                        <ul className="space-y-4 list-disc list-outside mb-10 pl-5">
                            <li className="">
                                <p className="text-slate-700">
                                    <b>Announcements –</b> Inform guests about opening hours, holidays, or special news.
                                </p>
                            </li>
                            <li className="">
                                <p className="text-slate-700">
                                    <b>Promotions –</b> Highlight discounts, happy hours, or new menu items.
                                </p>
                            </li>
                            <li className="">
                                <p className="text-slate-700">
                                    <b>Events –</b> Automatically display upcoming events in a popup.
                                </p>
                            </li>
                            <li className="">
                                <p className="text-slate-700">
                                    <b>Welcome message –</b> Greet visitors the first time they land on your page.
                                </p>
                            </li>
                        </ul>
                    </section>
                    <section>
                        <h3 className="flex items-center gap-2 text-2xl font-bold mb-4 text-slate-800">
                            Key Benefits
                        </h3>
                        <ul className="space-y-4 list-disc list-outside mb-10 pl-5">
                            <li className="">
                                <p className="text-slate-700">
                                    <b>Highly flexible –</b> Mix and match popup types for the best communication.
                                </p>
                            </li>
                            <li className="">
                                <p className="text-slate-700">
                                    <b>Custom timing –</b> Control exactly when your popup appears.
                                </p>
                            </li>
                            <li className="">
                                <p className="text-slate-700">
                                    <b>Event integration –</b> Automatically highlight your events without extra effort.
                                </p>
                            </li>
                            <li className="">
                                <p className="text-slate-700">
                                    <b>User-friendly –</b> Quick to set up and easy to adjust anytime.
                                </p>
                            </li>
                        </ul>
                    </section>
                    <section>
                        <h3 className="flex items-center gap-2 text-2xl font-bold mb-4 text-slate-800">
                            Tips
                        </h3>
                        <ul className="space-y-4 list-disc list-outside mb-10 pl-5">
                            <li className="">
                                <p className="text-slate-700">
                                    Use a short delay (e.g. 2–3 seconds) to make popups feel natural and not intrusive.
                                </p>
                            </li>
                            <li className="">
                                <p className="text-slate-700">
                                    Combine a general homepage popup with event popups for maximum visibility.
                                </p>
                            </li>
                            <li className="">
                                <p className="text-slate-700">
                                    Limit the number of events in one popup so it doesn’t overwhelm visitors.
                                </p>
                            </li>
                            <li className="">
                                <p className="text-slate-700">
                                    Regularly update popup content to keep your communication relevant.
                                </p>
                            </li>
                        </ul>
                    </section>
                </div>
                <Separator className="my-12" />
                <div id="qr-codes" className="scroll-mt-26">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-main-blue">
                        QR Codes
                    </h1>
                    <p className="text-lg text-muted-foreground mb-4">
                        Instantly generate QR codes that connect your guests directly to your menu, events, or
                        promotions. Every scan is tracked so you can measure engagement in real time.
                    </p>
                    <h1 className="text-xl md:text-2xl font-semibold tracking-tight mb-4 text-main-blue">
                        Overview
                    </h1>
                    <p className="text-lg text-muted-foreground mb-4">
                        QR codes make it easy for guests to access your digital content with just a scan from their
                        smartphone. Whether it’s your menu, your shop, or a special event, QR codes are a quick
                        and modern way to connect with customers, no downloads or complicated steps required.
                    </p>
                    <section>
                        <h3 className="flex items-center gap-2 text-2xl font-bold mb-4 text-slate-800">
                            How it works
                        </h3>
                        <ul className="space-y-4 list-none list-outside mb-10">
                            <li className="">
                                <p className="text-slate-700">
                                    <b>1. Generate a QR code</b>
                                </p>
                                <ul className="space-y-4 mt-3 list-disc list-outside mb-10 pl-10">
                                    <li className="">
                                        <p className="text-slate-700">
                                            Go to the <b>QR Code Generator</b> in your dashboard.
                                        </p>
                                    </li>
                                    <li className="">
                                        <p className="text-slate-700">
                                            Enter a <b>name</b> for your QR code (to recognize it later).
                                        </p>
                                    </li>
                                    <li className="">
                                        <p className="text-slate-700">
                                            Select the <b>type</b>:
                                        </p>
                                        <ul className="space-y-4 mt-3 list-disc list-outside mb-10 pl-5">
                                            <li className="">
                                                <p className="text-slate-700">
                                                    <b>Restaurant Page</b> → Link directly to your main profile page.
                                                </p>
                                            </li>
                                            <li className="">
                                                <p className="text-slate-700">
                                                    <b>Existing Link</b> → Choose a link you’ve already created in the Links
                                                    section via the dropdown.
                                                </p>
                                            </li>
                                            <li className="">
                                                <p className="text-slate-700">
                                                    <b>Custom Link</b> → Add an external URL, such as social media, ticket
                                                    sales, videos, or any other page.
                                                </p>
                                            </li>
                                        </ul>
                                    </li>
                                </ul>
                            </li>
                            <li className="">
                                <p className="text-slate-700">
                                    <b>2. Customize the design</b>
                                </p>
                                <ul className="space-y-4 mt-3 list-disc list-outside mb-10 pl-10">
                                    <li className="">
                                        <p className="text-slate-700">
                                            On the right-hand side, preview the current design of your QR code.
                                        </p>
                                    </li>
                                    <li className="">
                                        <p className="text-slate-700">
                                            Adjust the <b>colors</b> to match your brand identity.
                                        </p>
                                    </li>
                                    <li className="">
                                        <p className="text-slate-700">
                                            Upload your <b>logo</b> to be placed in the center.
                                        </p>
                                    </li>
                                    <li className="">
                                        <p className="text-slate-700">
                                            Add a <b>personalized text</b> below the QR code for extra context.
                                        </p>
                                    </li>
                                </ul>
                            </li>
                            <li className="">
                                <p className="text-slate-700">
                                    <b>3. Save & manage</b>
                                </p>
                                <ul className="space-y-4 mt-3 list-disc list-outside mb-10 pl-10">
                                    <li className="">
                                        <p className="text-slate-700">
                                            After generating the code, it is stored in your <b>overview list</b>.
                                        </p>
                                    </li>
                                    <li className="">
                                        <p className="text-slate-700">
                                            From here, you can download and use it for printing or digital sharing.
                                        </p>
                                    </li>
                                    <li className="">
                                        <p className="text-slate-700">
                                            Each QR code is tracked — you can see when and how often it has been
                                            scanned in your <b>Analytics dashboard</b>.
                                        </p>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </section>
                    <section>
                        <h3 className="flex items-center gap-2 text-2xl font-bold mb-4 text-slate-800">
                            Key Benefits
                        </h3>
                        <ul className="space-y-4 list-disc list-outside mb-10 pl-5">
                            <li className="">
                                <p className="text-slate-700">
                                    <b>Flexible linking –</b> Connect QR codes to your restaurant page, existing links, or any
                                    custom URL.
                                </p>
                            </li>
                            <li className="">
                                <p className="text-slate-700">
                                    <b>Brand customization –</b> Match QR codes to your brand colors, add your logo, and
                                    personalize text.
                                </p>
                            </li>
                            <li className="">
                                <p className="text-slate-700">
                                    <b>Trackable –</b> Every scan is logged so you can measure performance.
                                </p>
                            </li>
                            <li className="">
                                <p className="text-slate-700">
                                    <b>Reusable –</b> QR codes don’t change; when you update the linked content, the same
                                    code stays valid.
                                </p>
                            </li>
                        </ul>
                    </section>
                    <section>
                        <h3 className="flex items-center gap-2 text-2xl font-bold mb-4 text-slate-800">
                            Use cases
                        </h3>
                        <ul className="space-y-4 list-disc list-outside mb-10 pl-5">
                            <li className="">
                                <p className="text-slate-700">
                                    Place QR codes on tables for instant menu access.
                                </p>
                            </li>
                            <li className="">
                                <p className="text-slate-700">
                                    Add QR codes to flyers or posters to promote events.
                                </p>
                            </li>
                            <li className="">
                                <p className="text-slate-700">
                                    Share QR codes on social media for quick access to promotions or videos.
                                </p>
                            </li>
                            <li className="">
                                <p className="text-slate-700">
                                    Use branded QR codes at the entrance for a professional first impression.
                                </p>
                            </li>
                        </ul>
                    </section>
                    <section>
                        <h3 className="flex items-center gap-2 text-2xl font-bold mb-4 text-slate-800">
                            Tips
                        </h3>
                        <ul className="space-y-4 list-disc list-outside mb-10 pl-5">
                            <li className="">
                                <p className="text-slate-700">
                                    Always give your QR codes <b>clear names</b> so you can recognize them later in your
                                    overview.
                                </p>
                            </li>
                            <li className="">
                                <p className="text-slate-700">
                                    Test QR codes before printing to ensure they work on all devices.
                                </p>
                            </li>
                            <li className="">
                                <p className="text-slate-700">
                                    Use brand colors and your logo to build recognition.
                                </p>
                            </li>
                            <li className="">
                                <p className="text-slate-700">
                                    Regularly check analytics to see which QR codes perform best.
                                </p>
                            </li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
}
