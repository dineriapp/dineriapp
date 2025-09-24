"use client";

import { Separator } from "@/components/ui/separator";
import { useTranslations } from "next-intl";

type Item = string | Item[];


export default function FeaturesPage() {
    const a = useTranslations("HelpCenter.Features.Analytics")
    const o = useTranslations("HelpCenter.Features.Orders")
    const l = useTranslations("HelpCenter.Features.Links")
    const m = useTranslations("HelpCenter.Features.Menu")
    const e = useTranslations("HelpCenter.Features.Events")
    const f = useTranslations("HelpCenter.Features.FAQ")
    const p = useTranslations("HelpCenter.Features.Popups")
    const q = useTranslations("HelpCenter.Features.QRCodes")
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
                <Separator className="my-12" />
                <div id="menu" className="scroll-mt-26">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-main-blue">
                        {m("title")}
                    </h1>
                    <p
                        dangerouslySetInnerHTML={{
                            __html: m.raw("intro")
                        }}
                        className="text-lg text-muted-foreground mb-4">
                    </p>
                    <h1 className="text-xl md:text-2xl font-semibold tracking-tight mb-4 text-main-blue">
                        {m("overview_title")}
                    </h1>
                    <p className="text-lg text-muted-foreground mb-4">
                        {m("overview_text")}
                    </p>
                    <Separator className="my-12" />
                    <section>
                        <h3 className="flex items-center gap-2 text-2xl font-bold mb-4 text-slate-800">
                            {m("how_it_works.title")}
                        </h3>
                        <ul className="space-y-4 list-none list-outside mb-10">
                            {m.raw("how_it_works.steps").map((step: { title: string, points: string[] }, i: number) => (
                                <li key={i}>
                                    <p
                                        className="text-slate-700"
                                        dangerouslySetInnerHTML={{ __html: step.title }}
                                    />
                                    <ul className="space-y-4 mt-3 list-disc list-outside mb-10 pl-10">
                                        {step.points.map((p, j) => (
                                            <li key={j}>
                                                <p
                                                    className="text-slate-700"
                                                    dangerouslySetInnerHTML={{ __html: p }}
                                                />
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                            ))}
                        </ul>
                    </section>
                    <section>
                        <h3 className="flex items-center gap-2 text-2xl font-bold mb-4 text-slate-800">
                            {m("key_benefits.title")}
                        </h3>
                        <ul className="space-y-4 list-disc list-outside mb-10 pl-5">
                            {
                                m.raw("key_benefits.list").map((item: string, i: number) => (
                                    <li key={`key_benefits.list-${i}`} className="">
                                        <p
                                            dangerouslySetInnerHTML={{ __html: item }}
                                            className="text-slate-700">
                                        </p>
                                    </li>
                                ))
                            }
                        </ul>
                    </section>
                    <section>
                        <h3 className="flex items-center gap-2 text-2xl font-bold mb-4 text-slate-800">
                            {m("tips.title")}
                        </h3>
                        <ul className="space-y-4 list-disc list-outside mb-10 pl-5">
                            {
                                m.raw("tips.list").map((item: string, i: number) => (
                                    <li key={`key_benefits.list-${i}`} className="">
                                        <p
                                            dangerouslySetInnerHTML={{ __html: item }}
                                            className="text-slate-700">
                                        </p>
                                    </li>
                                ))
                            }
                        </ul>
                    </section>
                </div>
                <Separator className="my-12" />
                <div id="events" className="scroll-mt-26">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-main-blue">
                        {e("title")}
                    </h1>
                    <p className="text-lg text-muted-foreground mb-4">
                        {e("intro")}
                    </p>
                    <h1 className="text-xl md:text-2xl font-semibold tracking-tight mb-4 text-main-blue">
                        {e("overview_title")}
                    </h1>
                    <p className="text-lg text-muted-foreground mb-4">
                        {e("overview_text")}
                    </p>
                    <p
                        dangerouslySetInnerHTML={{ __html: e.raw("note") }}
                        className="text-lg  mb-4 text-black bg-green-100 w-fit p-4 rounded-xl">
                    </p>
                    <Separator className="my-12" />
                    <section>
                        <h3 className="flex items-center gap-2 text-2xl font-bold mb-4 text-slate-800">
                            {e("how_it_works.title")}
                        </h3>
                        <ul className="space-y-4
                         list-none list-outside mb-10">
                            {e.raw("how_it_works.steps")?.map(
                                (
                                    item: string | string[],
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
                                            <ul className="space-y-4 list-disc mt-3 list-outside mb-10 pl-10">
                                                {
                                                    item?.map((im, id) => {
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
                            {e("key_benefits.title")}
                        </h3>
                        <ul className="space-y-4 list-disc list-outside mb-10 pl-5">
                            {
                                e.raw("key_benefits.list")?.map((item: string, n: number) => (
                                    <li key={`key_benefits.t.${n}`} className="">
                                        <p
                                            dangerouslySetInnerHTML={{ __html: item }}
                                            className="text-slate-700">
                                        </p>
                                    </li>
                                ))
                            }
                        </ul>
                    </section>
                    <section>
                        <h3 className="flex items-center gap-2 text-2xl font-bold mb-4 text-slate-800">
                            {e("integration_popups.title")}
                        </h3>
                        <p className="text-lg text-muted-foreground mb-4">
                            {e("integration_popups.text")}
                        </p>
                        <ul className="space-y-4 list-disc list-outside mb-10 pl-5">
                            {
                                e.raw("integration_popups.list")?.map((item: string, n: number) => (
                                    <li key={`key_benefits.t.${n}`} className="">
                                        <p
                                            dangerouslySetInnerHTML={{ __html: item }}
                                            className="text-slate-700">
                                        </p>
                                    </li>
                                ))
                            }
                        </ul>
                    </section>
                    <section>
                        <h3 className="flex items-center gap-2 text-2xl font-bold mb-4 text-slate-800">
                            {e("tips.title")}
                        </h3>
                        <ul className="space-y-4 list-disc list-outside mb-10 pl-5">
                            {
                                e.raw("tips.list")?.map((item: string, n: number) => (
                                    <li key={`key_benefits.t.${n}`} className="">
                                        <p
                                            dangerouslySetInnerHTML={{ __html: item }}
                                            className="text-slate-700">
                                        </p>
                                    </li>
                                ))
                            }
                        </ul>
                    </section>
                </div>
                <Separator className="my-12" />
                <div id="faq" className="scroll-mt-26">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-main-blue">
                        {f("title")}
                    </h1>
                    <p className="text-lg text-muted-foreground mb-4">
                        {f("intro")}
                    </p>
                    <h1 className="text-xl md:text-2xl font-semibold tracking-tight mb-4 text-main-blue">
                        {f("overview_title")}
                    </h1>
                    <p className="text-lg text-muted-foreground mb-4">
                        {f("overview_text")}
                    </p>
                    <p
                        dangerouslySetInnerHTML={{
                            __html: f.raw("note")
                        }}
                        className="text-lg  mb-6 text-black bg-green-100 w-fit p-4 rounded-xl">
                    </p>
                    <section>
                        <h3 className="flex items-center gap-2 text-2xl font-bold mb-4 text-slate-800">
                            {f("how_it_works.title")}
                        </h3>
                        <ul className="space-y-4 list-none list-outside mb-10">
                            {f.raw("how_it_works.steps")?.map(
                                (
                                    item: string | string[],
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
                                            <ul className="space-y-4 list-disc mt-3 list-outside mb-10 pl-10">
                                                {
                                                    item?.map((im, id) => {
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
                            {f("key_benefits.title")}
                        </h3>
                        <ul className="space-y-4 list-disc list-outside mb-10 pl-5">
                            {
                                f.raw("key_benefits.list")?.map((item: string, n: number) => (
                                    <li key={`key_benefits.t.${n}`} className="">
                                        <p
                                            dangerouslySetInnerHTML={{ __html: item }}
                                            className="text-slate-700">
                                        </p>
                                    </li>
                                ))
                            }

                        </ul>
                    </section>
                    <section>
                        <h3 className="flex items-center gap-2 text-2xl font-bold mb-4 text-slate-800">
                            {f("tips.title")}
                        </h3>
                        <ul className="space-y-4 list-disc list-outside mb-10 pl-5">
                            {
                                f.raw("tips.list")?.map((item: string, n: number) => (
                                    <li key={`tips23.t.${n}`} className="">
                                        <p
                                            dangerouslySetInnerHTML={{ __html: item }}
                                            className="text-slate-700">
                                        </p>
                                    </li>
                                ))
                            }
                        </ul>
                    </section>
                </div>
                <Separator className="my-12" />
                <div id="popups" className="scroll-mt-26">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-main-blue">
                        {p("title")}
                    </h1>
                    <p dangerouslySetInnerHTML={{ __html: p.raw("intro") }} className="text-lg text-muted-foreground mb-4">
                    </p>
                    <h1 className="text-xl md:text-2xl font-semibold tracking-tight mb-4 text-main-blue">
                        {p("overview_title")}
                    </h1>
                    <p className="text-lg text-muted-foreground mb-4">
                        {p("overview_text")}
                    </p>
                    <p dangerouslySetInnerHTML={{ __html: p.raw("note") }} className="text-lg  mb-6 text-black bg-green-100 w-fit p-4 rounded-xl">
                    </p>
                    <section>
                        <h3 className="flex items-center gap-2 text-2xl font-bold mb-4 text-slate-800">
                            {p("popup_types.title")}
                        </h3>
                        <p dangerouslySetInnerHTML={{ __html: p.raw("popup_types.text") }} className="text-lg text-muted-foreground mb-4">
                        </p>
                        <ul className="space-y-4 list-disc list-outside mb-6 pl-5">
                            {
                                p.raw("popup_types.list")?.map((item: string, idx: number) => (
                                    <li
                                        key={`popup_types.list.${idx}`} className="">
                                        <p
                                            dangerouslySetInnerHTML={{ __html: item }}
                                            className="text-slate-700">
                                        </p>
                                    </li>
                                ))
                            }
                        </ul>
                        <p
                            dangerouslySetInnerHTML={{ __html: p.raw("popup_types.note") }}
                            className="text-lg mb-6 text-black bg-green-100 w-fit p-4 rounded-xl">
                        </p>
                    </section>
                    <section>
                        <h3 className="flex items-center gap-2 text-2xl font-bold mb-4 text-slate-800">
                            {p("how_it_works.title")}
                        </h3>
                        <ul className="space-y-4 list-none list-outside mb-10">
                            {p.raw("how_it_works.steps")?.map((item: Item, index: number) =>
                                typeof item === "string" ? (
                                    <li key={index}>
                                        <p
                                            dangerouslySetInnerHTML={{ __html: item }}
                                            className="text-slate-700"
                                        />
                                    </li>
                                ) : (
                                    <ul
                                        key={index}
                                        className="space-y-4 list-disc mt-3 list-outside mb-10 pl-10"
                                    >
                                        {item.map((subItem: Item, subIndex: number) =>
                                            typeof subItem === "string" ? (
                                                <li key={subIndex}>
                                                    <p
                                                        dangerouslySetInnerHTML={{ __html: subItem }}
                                                        className="text-slate-700"
                                                    />
                                                </li>
                                            ) : (
                                                <ul
                                                    key={subIndex}
                                                    className="space-y-4 list-disc mt-3 list-outside mb-10 pl-10"
                                                >
                                                    {subItem.map((deepItem: Item, deepIndex: number) => (
                                                        <li key={deepIndex}>
                                                            <p
                                                                dangerouslySetInnerHTML={{
                                                                    __html: deepItem as string,
                                                                }}
                                                                className="text-slate-700"
                                                            />
                                                        </li>
                                                    ))}
                                                </ul>
                                            )
                                        )}
                                    </ul>
                                )
                            )}
                        </ul>
                    </section>
                    <section>
                        <h3 className="flex items-center gap-2 text-2xl font-bold mb-4 text-slate-800">
                            {p("use_cases.title")}
                        </h3>
                        <ul className="space-y-4 list-disc list-outside mb-10 pl-5">
                            {
                                p.raw("use_cases.list")?.map((item: string, idx: number) => (
                                    <li
                                        key={`use_cases.list2323.${idx}`} className="">
                                        <p
                                            dangerouslySetInnerHTML={{ __html: item }}
                                            className="text-slate-700">
                                        </p>
                                    </li>
                                ))
                            }
                        </ul>
                    </section>
                    <section>
                        <h3 className="flex items-center gap-2 text-2xl font-bold mb-4 text-slate-800">
                            {p("key_benefits.title")}
                        </h3>
                        <ul className="space-y-4 list-disc list-outside mb-10 pl-5">
                            {
                                p.raw("key_benefits.list")?.map((item: string, idx: number) => (
                                    <li
                                        key={`key_benefits.list22323.${idx}`} className="">
                                        <p
                                            dangerouslySetInnerHTML={{ __html: item }}
                                            className="text-slate-700">
                                        </p>
                                    </li>
                                ))
                            }
                        </ul>
                    </section>
                    <section>
                        <h3 className="flex items-center gap-2 text-2xl font-bold mb-4 text-slate-800">
                            {p("tips.title")}
                        </h3>
                        <ul className="space-y-4 list-disc list-outside mb-10 pl-5">
                            {
                                p.raw("tips.list")?.map((item: string, idx: number) => (
                                    <li
                                        key={`tips.list22sd323.${idx}`} className="">
                                        <p
                                            dangerouslySetInnerHTML={{ __html: item }}
                                            className="text-slate-700">
                                        </p>
                                    </li>
                                ))
                            }
                        </ul>
                    </section>
                </div>
                {/* d  */}
                <Separator className="my-12" />
                <div id="qr-codes" className="scroll-mt-26">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-main-blue">
                        {q("title")}
                    </h1>
                    <p className="text-lg text-muted-foreground mb-4">
                        {q("intro")}
                    </p>
                    <h1 className="text-xl md:text-2xl font-semibold tracking-tight mb-4 text-main-blue">
                        {q("overview_title")}
                    </h1>
                    <p className="text-lg text-muted-foreground mb-4">
                        {q("overview_text")}
                    </p>
                    <section>
                        <h3 className="flex items-center gap-2 text-2xl font-bold mb-4 text-slate-800">
                            {q("how_it_works.title")}
                        </h3>
                        <ul className="space-y-4 list-none list-outside mb-10">
                            {q.raw("how_it_works.steps")?.map((item: Item, index: number) =>
                                typeof item === "string" ? (
                                    <li key={index}>
                                        <p
                                            dangerouslySetInnerHTML={{ __html: item }}
                                            className="text-slate-700 font-bold"
                                        />
                                    </li>
                                ) : (
                                    <ul
                                        key={index}
                                        className="space-y-4 list-disc mt-3 list-outside mb-10 pl-10"
                                    >
                                        {item.map((subItem: Item, subIndex: number) =>
                                            typeof subItem === "string" ? (
                                                <li key={subIndex}>
                                                    <p
                                                        dangerouslySetInnerHTML={{ __html: subItem }}
                                                        className="text-slate-700"
                                                    />
                                                </li>
                                            ) : (
                                                <ul
                                                    key={subIndex}
                                                    className="space-y-4 list-disc mt-3 list-outside mb-10 pl-10"
                                                >
                                                    {subItem.map((deepItem: Item, deepIndex: number) => (
                                                        <li key={deepIndex}>
                                                            <p
                                                                dangerouslySetInnerHTML={{
                                                                    __html: deepItem as string,
                                                                }}
                                                                className="text-slate-700"
                                                            />
                                                        </li>
                                                    ))}
                                                </ul>
                                            )
                                        )}
                                    </ul>
                                )
                            )}
                        </ul>
                    </section>
                    <section>
                        <h3 className="flex items-center gap-2 text-2xl font-bold mb-4 text-slate-800">
                            {q("key_benefits.title")}
                        </h3>
                        <ul className="space-y-4 list-disc list-outside mb-10 pl-5">
                            {q.raw("key_benefits.list")?.map((item: string, ix: number) => (
                                <li key={`sdasdasdasdas-${ix}`} className="">
                                    <p
                                        dangerouslySetInnerHTML={{ __html: item }}
                                        className="text-slate-700">
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </section>
                    <section>
                        <h3 className="flex items-center gap-2 text-2xl font-bold mb-4 text-slate-800">
                            {q("use_cases.title")}
                        </h3>
                        <ul className="space-y-4 list-disc list-outside mb-10 pl-5">
                            {q.raw("use_cases.list")?.map((item: string, ix: number) => (
                                <li key={`sdasdause_casessdasdas-${ix}`} className="">
                                    <p
                                        dangerouslySetInnerHTML={{ __html: item }}
                                        className="text-slate-700">
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </section>
                    <section>
                        <h3 className="flex items-center gap-2 text-2xl font-bold mb-4 text-slate-800">
                            {q("tips.title")}
                        </h3>
                        <ul className="space-y-4 list-disc list-outside mb-10 pl-5">
                            {q.raw("tips.list")?.map((item: string, ix: number) => (
                                <li key={`tipssadsadsa-${ix}`} className="">
                                    <p
                                        dangerouslySetInnerHTML={{ __html: item }}
                                        className="text-slate-700">
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
}
