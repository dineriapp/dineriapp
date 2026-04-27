"use client";

import { MultiImageUploader } from '@/components/shared/image-upader';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { GalleryItemSchema, GalleryItemSchemaValues } from '@/lib/gallery-item.schema';
import { GalleryItemType, useGallerySave } from '@/lib/gallery-queries';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader, UploadIcon, X } from 'lucide-react';
import { motion } from "motion/react";
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

type Props = {
    isModalOpen: boolean,
    restaurantId: string,
    setIsModalOpen: Dispatch<SetStateAction<boolean>>
    editingItem?: GalleryItemType | null;
    onClose?: () => void;
}

const GalleryItemForm = ({ setIsModalOpen, restaurantId, editingItem, onClose }: Props) => {
    const t = useTranslations("GalleryItemForm");
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const { mutate: saveItem, isPending: isPendingDraft } = useGallerySave();

    const form = useForm<GalleryItemSchemaValues>({
        resolver: zodResolver(GalleryItemSchema),
        defaultValues: {
            file: [],
            title: "",
            type: "IMAGE"
        },
        mode: "onSubmit",
        reValidateMode: "onChange",
    });

    const type = useWatch({
        control: form.control,
        name: "type"
    })

    useEffect(() => {
        if (editingItem) {
            if (editingItem.type === "IMAGE") {
                form.reset({
                    type: "IMAGE",
                    title: editingItem.title,
                    file: [editingItem.file],
                    link: editingItem.link || undefined,
                });
                form.clearErrors("youtubeUrl");
            } else {
                form.reset({
                    type: "VIDEO",
                    title: editingItem.title,
                    youtubeUrl: editingItem.youtubeUrl,
                    link: editingItem.link || undefined,
                    file: []
                });
                form.clearErrors("file");
            }
        } else {
            form.reset({ file: [], title: "", type: "IMAGE" });
        }
    }, [editingItem, form]);

    const handleSubmit = (data: GalleryItemSchemaValues) => {
        const payload = editingItem ? { id: editingItem.id, ...data } : data;
        saveItem({ restaurantId, payload }, {
            onSuccess: () => {
                toast.success(editingItem ? t("toasts.updateSuccess") : t("toasts.addSuccess"));
                form.reset({ file: [], title: "", link: "" });
                setIsModalOpen(false);
                onClose?.();
            },
            onError: (err) => toast.error(err?.message || t("toasts.saveError")),
        });
    };

    console.log(form.formState)

    return (
        <form onSubmit={form.handleSubmit(handleSubmit)} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800">
                        {editingItem ? t("titleEdit") : t("titleAdd")}
                    </h2>
                    <button type='button' onClick={() => { setIsModalOpen(false); onClose?.() }} className="p-1 rounded-full hover:bg-slate-100">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="p-5 space-y-4">
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant={type === "IMAGE" ? "default" : "outline"}
                            onClick={() => {
                                form.setValue("type", "IMAGE");
                                form.clearErrors("youtubeUrl");
                            }}
                        >
                            {t("imageButton")}
                        </Button>
                        <Button
                            type="button"
                            variant={type === "VIDEO" ? "default" : "outline"}
                            onClick={() => {
                                form.setValue("type", "VIDEO")
                                form.clearErrors("file");
                            }}
                        >
                            {t("videoButton")}
                        </Button>
                    </div>
                    <div>
                        <Controller
                            name="title"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid} className="gap-2">
                                    <FieldLabel htmlFor="title" className="text-slate-700! font-medium flex items-center gap-2 text-sm">
                                        {t("titleLabel")}<span className="text-rose-500">*</span>
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id="name"
                                        placeholder={t("titlePlaceholder")}
                                        autoComplete="off"
                                        className="px-4 py-2.5 h-fit rounded-xl border-slate-200 focus:border-app-primary focus:ring-app-primary/20 transition-all duration-200"
                                        aria-invalid={fieldState.invalid}
                                    />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                    </div>

                    {type === "IMAGE" && <div>
                        <Controller
                            name="file"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid} className="gap-2! pb-0! mb-!">
                                    <FieldLabel htmlFor="Image" className="text-slate-700! font-medium flex items-center gap-2 text-sm">
                                        {t("mediaFileLabel")} <span className="text-rose-500">*</span>
                                    </FieldLabel>
                                    <MultiImageUploader
                                        value={field.value ?? []}
                                        onChange={field.onChange}
                                        gridClassName="grid-cols-1 gap-3"
                                        className="w-full max-w-80"
                                        PreviewItemClassName="aspect-video!   rounded-xl! overflow-hidden"
                                        maxFiles={1}
                                        showLimit={false}
                                        onUploadingChange={setIsUploadingImage}
                                        triggerClassName="w-full bg-white rounded-xl! hover:bg-gray-300 cursor-pointer"
                                    >
                                        <div className="w-full max-w-80 rounded-xl aspect-video! border-2 border-dashed border-gray-300 hover:border-emerald-500 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer bg-white hover:bg-gray-100">
                                            <UploadIcon className="text-gray-500 size-5" />
                                        </div>
                                    </MultiImageUploader>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                    </div>}

                    {type === "VIDEO" && (
                        <Controller
                            name="youtubeUrl"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel>{t("youtubeUrlLabel")} *</FieldLabel>
                                    <Input
                                        {...field}
                                        className="px-4 py-2.5 h-fit rounded-xl border-slate-200 focus:border-app-primary focus:ring-app-primary/20 transition-all duration-200"
                                        placeholder={t("youtubeUrlPlaceholder")}
                                    />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                    )}

                    <div>
                        <Controller
                            name="link"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid} className="gap-2">
                                    <FieldLabel htmlFor="name" className="text-slate-700! font-medium flex items-center gap-2 text-sm">
                                        {t("externalLinkLabel")}
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id="name"
                                        placeholder={t("externalLinkPlaceholder")}
                                        autoComplete="off"
                                        className="px-4 py-2.5 h-fit rounded-xl border-slate-200 focus:border-app-primary focus:ring-app-primary/20 transition-all duration-200"
                                        aria-invalid={fieldState.invalid}
                                    />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                        <p className="text-xs text-slate-400 mt-1">{t("externalLinkHint")}</p>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => { setIsModalOpen(false); onClose?.() }}>{t("cancelButton")}</Button>
                        <Button type="submit" disabled={isUploadingImage || form.formState.isSubmitting || isPendingDraft} className="bg-teal-600 hover:bg-teal-700">
                            {
                                isPendingDraft &&
                                <>
                                    <Loader className='size-4 animate-spin' />
                                </>
                            }
                            {editingItem ? t("submitUpdate") : t("submitAdd")}
                        </Button>
                    </div>
                </div>
            </motion.div>
        </form>
    )
}

export default GalleryItemForm