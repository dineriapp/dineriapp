"use client";

import { MultiImageUploader } from '@/components/shared/image-upader';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { StoryLineSchema, StoryLineSchemaValues } from '@/lib/story-line.schema';
import { useStorySave } from '@/lib/use-story';
import { zodResolver } from '@hookform/resolvers/zod';
import { StoryLine } from '@prisma/client';
import { Loader, UploadIcon } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

const StoryLineClientSide = ({ storyLine, restaurntID }: { storyLine: StoryLine, restaurntID: string }) => {
    const t = useTranslations("StoryLine");
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const { mutate: save, isPending: isPendingSave } = useStorySave();

    const form = useForm<StoryLineSchemaValues>({
        resolver: zodResolver(StoryLineSchema),
        defaultValues: {
            description: storyLine.description ?? "",
            title: storyLine.title ?? "",
            show: storyLine.show,
            file: storyLine.file
                ? [{
                    url: (storyLine.file as any).url,
                    key: (storyLine.file as any).key
                }]
                : []
        },
        mode: "onSubmit",
        reValidateMode: "onChange",
    });

    const handleSave = (data: StoryLineSchemaValues) => {
        save({ ...data, id: restaurntID }, {
            onSuccess: () => {
                toast.success(t("toasts.saveSuccess"));
            },
            onError: (err) => {
                toast.error(err?.message || t("toasts.saveError"));
            },
        });
    };

    return (
        <form onSubmit={form.handleSubmit(handleSave)}>
            <div className="w-full mx-auto px-4 sm:px-8 py-8">
                {/* Card container */}
                <div className="">
                    {/* Enhanced Header Section */}
                    <div className="">
                        <div className="flex items-center gap-3">
                            <div>
                                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800">
                                    {t("title")}
                                </h2>
                                <p className="text-sm text-slate-500 mt-1.5 max-w-2xl">
                                    {t("subtitle")}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="py-4">
                        {/* Two-column layout for desktop */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-10">
                            {/* Left Column: Image Upload */}
                            <div className="space-y-2">
                                <Controller
                                    name="file"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid} className="gap-2! pb-0! mb-!">
                                            <FieldLabel htmlFor="Image" className="text-slate-700! font-semibold flex items-center gap-2 text-sm">
                                                {t("imageLabel")} <span className="text-rose-500">{t("imageRequired")}</span>
                                                <span className="text-xs font-normal text-slate-400 ml-1">{t("imageMaxHint")}</span>
                                            </FieldLabel>
                                            <MultiImageUploader
                                                value={field.value ?? []}
                                                onChange={field.onChange}
                                                gridClassName="grid-cols-1 gap-3"
                                                className="w-full"
                                                PreviewItemClassName="aspect-video! rounded-xl! overflow-hidden shadow-sm border border-slate-200"
                                                maxFiles={1}
                                                showLimit={false}
                                                onUploadingChange={setIsUploadingImage}
                                                triggerClassName="w-full rounded-xl! overflow-hidden transition-all duration-200 hover:ring-2 hover:ring-teal-400/50"
                                            >
                                                <div className="w-full rounded-xl aspect-video! border-2 border-dashed border-slate-200 hover:border-teal-400 bg-white hover:bg-teal-50/20 transition-all duration-200 flex flex-col items-center justify-center gap-3 cursor-pointer group">
                                                    <div className="p-3 bg-white rounded-full shadow-sm group-hover:shadow-md transition-all">
                                                        <UploadIcon className="text-slate-400 group-hover:text-teal-500 size-5 transition-colors" />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-sm font-medium text-slate-600 group-hover:text-teal-600">{t("uploadButtonText")}</p>
                                                        <p className="text-xs text-slate-400 mt-1">{t("uploadHint")}</p>
                                                    </div>
                                                </div>
                                            </MultiImageUploader>
                                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                        </Field>
                                    )}
                                />
                                <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                                    <span className="inline-block w-1 h-1 rounded-full bg-teal-400"></span>
                                    {t("recommendedRatio")}
                                </p>
                            </div>

                            {/* Right Column: Title & Description */}
                            <div className="space-y-3">
                                <Controller
                                    name="show"
                                    control={form.control}
                                    render={({ field }) => (
                                        <div className="flex bg-white items-center justify-between border rounded-xl px-4 py-3">
                                            <div>
                                                <p className="text-sm font-medium text-slate-700">
                                                    {t("showToggleLabel")}
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    {t("showToggleHint")}
                                                </p>
                                            </div>

                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </div>
                                    )}
                                />
                                {/* Title Field */}
                                <Controller
                                    name="title"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid} className="gap-2">
                                            <FieldLabel htmlFor="title" className="text-slate-700! font-semibold flex items-center gap-2 text-sm">
                                                {t("titleFieldLabel")} <span className="text-rose-500">*</span>
                                            </FieldLabel>
                                            <Input
                                                {...field}
                                                id="name"
                                                placeholder={t("titleFieldPlaceholder")}
                                                autoComplete="off"
                                                className="px-4 py-2.5 h-fit rounded-xl border-slate-200 bg-white focus:border-teal-400 focus:ring-teal-400/30 transition-all duration-200"
                                                aria-invalid={fieldState.invalid}
                                            />
                                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                        </Field>
                                    )}
                                />

                                {/* Description Field */}
                                <Controller
                                    name="description"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid} className="gap-2">
                                            <FieldLabel htmlFor="title" className="text-slate-700! font-semibold flex items-center gap-2 text-sm">
                                                {t("contentFieldLabel")} <span className="text-rose-500">*</span>
                                            </FieldLabel>
                                            <Textarea
                                                {...field}
                                                id="name"
                                                placeholder={t("contentFieldPlaceholder")}
                                                autoComplete="off"
                                                rows={5}
                                                className="px-4 py-2.5 rounded-xl min-h-60 bg-white border-slate-200 focus:border-teal-400 focus:ring-teal-400/30 duration-200 resize-vertical"
                                                aria-invalid={fieldState.invalid}
                                            />
                                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                        </Field>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Form Actions - Save Button */}
                        <div className="border-t pt-3 border-slate-100 flex justify-end">
                            <Button
                                type="submit"
                                disabled={isUploadingImage || form.formState.isSubmitting || isPendingSave}
                                className="bg-teal-600 hover:bg-teal-700"
                            >
                                {isPendingSave ? (
                                    <>
                                        <Loader className='size-4 animate-spin' />
                                        {t("savingButton")}
                                    </>
                                ) : (
                                    <>
                                        {t("saveButton")}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default StoryLineClientSide;