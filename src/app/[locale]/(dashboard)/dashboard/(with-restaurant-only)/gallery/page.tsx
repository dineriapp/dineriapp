"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { GalleryItemType, useGalleryDelete, useGalleryItems, useGalleryReorder } from "@/lib/gallery-queries";
import { useRestaurantStore } from "@/stores/restaurant-store";
import {
    closestCenter,
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    arrayMove,
    rectSortingStrategy,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    GripVertical,
    Image as ImageIcon,
    Loader,
    Pencil,
    Play,
    Plus,
    Search,
    Trash2,
} from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import GalleryItemForm from "./_components/gallery-item-form";

interface VideoThumbnailProps {
    thumbnailUrl: string;
    embedUrl: string;
    title: string;
    isDragging?: boolean;
}

const VideoThumbnail = ({ thumbnailUrl, embedUrl, title, isDragging = false }: VideoThumbnailProps) => {
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        if (isDragging && isPlaying) {
            setIsPlaying(false);
        }
    }, [isDragging, isPlaying]);

    if (isDragging || !isPlaying) {
        return (
            <div className="relative w-full h-full group/video">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={thumbnailUrl}
                    alt={title}
                    className="w-full h-full object-cover"
                />
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsPlaying(true);
                    }}
                    className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover/video:opacity-100 transition-opacity"
                >
                    <div className="bg-white/90 rounded-full p-2 shadow-lg">
                        <Play className="h-8 w-8 text-black fill-black" />
                    </div>
                </button>
            </div>
        );
    }

    return (
        <iframe
            src={embedUrl}
            className="w-full h-full object-cover"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
        />
    );
};

interface SortableGalleryItemProps {
    item: GalleryItemType;
    onEdit: (item: GalleryItemType) => void;
    onDelete: (id: string) => void;
    isDeleting: boolean;
}

const SortableGalleryItem = memo(({ item, onEdit, onDelete, isDeleting }: SortableGalleryItemProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        willChange: "transform",
    };

    const isVideo = item.type === "VIDEO";

    return (
        <div ref={setNodeRef} style={style}>
            <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 gap-0! py-0! hover:-translate-y-1">
                <div className="relative aspect-video! overflow-hidden bg-slate-100">
                    <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            {...attributes}
                            {...listeners}
                            className="cursor-grab active:cursor-grabbing bg-black/50 hover:bg-black/70 rounded-full p-1.5 transition-colors touch-manipulation"
                            aria-label="Drag to reorder"
                        >
                            <GripVertical className="h-4 w-4 text-white" />
                        </button>
                    </div>

                    {isVideo ? (
                        <VideoThumbnail
                            thumbnailUrl={item.thumbnail!}
                            embedUrl={item.youtubeEmbedUrl!}
                            title={item.title}
                            isDragging={isDragging}
                        />
                    ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={item.file.url}
                            alt={item.title}
                            className="w-full h-full object-cover"
                        />
                    )}

                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                            size="icon"
                            variant="secondary"
                            className="h-8 w-8 rounded-full bg-white/90 hover:bg-white"
                            onClick={() => onEdit(item)}
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                            size="icon"
                            variant="destructive"
                            className="h-8 w-8 rounded-full bg-red-500/90 hover:bg-red-600"
                            onClick={() => onDelete(item.id)}
                            disabled={isDeleting}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <CardContent className="p-4!">
                    <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-slate-800 line-clamp-1 truncate">{item.title}</h3>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
});

SortableGalleryItem.displayName = "SortableGalleryItem";

const NormalGalleryItem = memo(({ item, onEdit, onDelete, isDeleting }: SortableGalleryItemProps) => {
    const isVideo = item.type === "VIDEO";
    const [isPlaying, setIsPlaying] = useState(false);

    return (
        <div>
            <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 gap-0! py-0! hover:-translate-y-1">
                <div className="relative aspect-video! overflow-hidden bg-slate-100">
                    {isVideo ? (
                        !isPlaying ? (
                            <div className="relative w-full h-full group/video">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={item.thumbnail!}
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsPlaying(true);
                                    }}
                                    className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover/video:opacity-100 transition-opacity"
                                >
                                    <div className="bg-white/90 rounded-full p-2 shadow-lg">
                                        <Play className="h-8 w-8 text-black fill-black" />
                                    </div>
                                </button>
                            </div>
                        ) : (
                            <iframe
                                src={item.youtubeEmbedUrl!}
                                className="w-full h-full object-cover"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        )
                    ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={item.file.url}
                            alt={item.title}
                            className="w-full h-full object-cover"
                        />
                    )}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                            size="icon"
                            variant="secondary"
                            className="h-8 w-8 rounded-full bg-white/90 hover:bg-white"
                            onClick={() => onEdit(item)}
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                            size="icon"
                            variant="destructive"
                            className="h-8 w-8 rounded-full bg-red-500/90 hover:bg-red-600"
                            onClick={() => onDelete(item.id)}
                            disabled={isDeleting}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <CardContent className="p-4!">
                    <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-slate-800 line-clamp-1 truncate">{item.title}</h3>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
});

NormalGalleryItem.displayName = "NormalGalleryItem";

export default function GalleryPage() {
    const t = useTranslations("GalleryPage");
    const { selectedRestaurant: restaurant } = useRestaurantStore();
    const { data: galleryItems, isPending, refetch } = useGalleryItems(restaurant?.id);
    const { mutate: deleteGalleryItem, isPending: isDeleting } = useGalleryDelete();

    const [searchTerm, setSearchTerm] = useState("");
    const [orderedItems, setOrderedItems] = useState<GalleryItemType[]>([]);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<GalleryItemType | null>(null);
    const { mutate: reorderItems, isPending: isReordering } = useGalleryReorder();

    useEffect(() => {
        if (galleryItems) {
            const sorted = [...galleryItems].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
            setOrderedItems(sorted);
        }
    }, [galleryItems]);

    const hasActiveFilters = !!searchTerm;

    useEffect(() => {
        if (!hasActiveFilters && galleryItems) {
            const sorted = [...galleryItems].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
            setOrderedItems(sorted);
            setHasUnsavedChanges(false);
        }
    }, [hasActiveFilters, galleryItems]);

    const filteredItems = useMemo(() => {
        if (!searchTerm) return orderedItems;
        const term = searchTerm.toLowerCase();
        return orderedItems.filter((item) => item.title.toLowerCase().includes(term));
    }, [orderedItems, searchTerm]);

    const displayItems = hasActiveFilters ? filteredItems : orderedItems;

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 5, delay: 0, tolerance: 5 },
        }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDelete = useCallback(
        (id: string) => {
            if (!restaurant?.id) return;
            if (!confirm(t("deleteConfirm"))) return;
            deleteGalleryItem(
                { restaurantId: restaurant.id, itemId: id },
                {
                    onSuccess: () => {
                        toast.success(t("toasts.deleteSuccess"));
                        refetch();
                    },
                    onError: (err) => toast.error(err?.message || t("toasts.deleteError")),
                }
            );
        },
        [restaurant?.id, deleteGalleryItem, refetch, t]
    );

    const openEdit = useCallback((item: GalleryItemType) => {
        setEditingItem(item);
        setIsModalOpen(true);
    }, []);

    const handleModalClose = useCallback(() => {
        setIsModalOpen(false);
        setEditingItem(null);
    }, []);

    const handleDragStart = useCallback((event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    }, []);

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            const { active, over } = event;
            setActiveId(null);
            if (!over || active.id === over.id) return;

            const oldIndex = orderedItems.findIndex((i) => i.id === active.id);
            const newIndex = orderedItems.findIndex((i) => i.id === over.id);
            if (oldIndex !== -1 && newIndex !== -1) {
                const newOrder = arrayMove(orderedItems, oldIndex, newIndex);
                const updatedOrder = newOrder.map((item, idx) => ({ ...item, sort_order: idx }));
                setOrderedItems(updatedOrder);
                setHasUnsavedChanges(true);
            }
        },
        [orderedItems]
    );

    const handleDragCancel = useCallback(() => setActiveId(null), []);

    const handleSaveOrder = useCallback(async () => {
        if (!restaurant?.id) return;

        const payload = orderedItems.map((item, idx) => ({
            id: item.id,
            sort_order: idx,
        }));

        console.log("Saving gallery order:", payload);

        reorderItems(
            { restaurantId: restaurant.id, items: payload },
            {
                onSuccess: () => {
                    setHasUnsavedChanges(false);
                    toast.success(t("toasts.saveOrderSuccess"));
                },
                onError: (error) => {
                    console.error(error);
                    toast.error(t("toasts.saveOrderError"));
                },
            }
        );
    }, [restaurant?.id, orderedItems, reorderItems, t]);

    const activeItem = activeId ? orderedItems.find((item) => item.id === activeId) : null;

    if (isPending) {
        return (
            <main className="w-full mx-auto px-4 py-8">
                <div className="w-full min-h-[50dvh] flex items-center justify-center flex-col">
                    <Loader className="size-5 animate-spin" />
                </div>
            </main>
        );
    }

    return (
        <main className="w-full mx-auto px-4 py-8">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-black">{t("title")}</h1>
                    <p className="mt-2 text-slate-500">
                        {t("subtitle")}
                    </p>
                </div>
                <div className="flex gap-2">
                    {!hasActiveFilters && hasUnsavedChanges && (
                        <Button
                            onClick={handleSaveOrder}
                            disabled={isReordering}
                            className="bg-green-600 hover:bg-green-700 text-white rounded-full px-4! gap-1!"
                        >
                            {isReordering && <Loader className="h-4 w-4 animate-spin" />}
                            {t("saveOrder")}
                        </Button>
                    )}
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-teal-600 hover:bg-teal-700 text-white rounded-full px-4! gap-1!"
                    >
                        <Plus className="h-4 w-4" /> {t("addMedia")}
                    </Button>
                </div>
            </div>

            <div className="mb-6">
                <div className="relative bg-white rounded-full">
                    <Search className="absolute left-5 top-4 h-5 w-5 text-slate-400" />
                    <Input
                        placeholder={t("searchPlaceholder")}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 rounded-full h-12.5 focus:ring-teal-500"
                    />
                </div>
                {hasActiveFilters && (
                    <p className="text-xs text-slate-400 mt-2">
                        {t("searchDisabledMessage")}
                    </p>
                )}
            </div>

            {displayItems.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 rounded-2xl">
                    <ImageIcon className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                    <h3 className="text-xl font-medium text-slate-600">{t("emptyTitle")}</h3>
                    <p className="text-slate-400 mt-1">
                        {searchTerm ? t("emptySearchSuggestion") : t("emptyDefaultSuggestion")}
                    </p>
                </div>
            ) : hasActiveFilters ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayItems.map((item) => (
                        <NormalGalleryItem
                            key={item.id}
                            item={item}
                            onEdit={openEdit}
                            onDelete={handleDelete}
                            isDeleting={isDeleting}
                        />
                    ))}
                </div>
            ) : (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDragCancel={handleDragCancel}
                >
                    <SortableContext items={orderedItems.map((i) => i.id)} strategy={rectSortingStrategy}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {orderedItems.map((item) => (
                                <SortableGalleryItem
                                    key={item.id}
                                    item={item}
                                    onEdit={openEdit}
                                    onDelete={handleDelete}
                                    isDeleting={isDeleting}
                                />
                            ))}
                        </div>
                    </SortableContext>
                    <DragOverlay dropAnimation={null}>
                        {activeItem ? (
                            <div className="opacity-90 transition-transform cursor-grabbing">
                                <Card className="overflow-hidden shadow-2xl border-2 border-teal-500 gap-0! py-0!">
                                    <div className="relative aspect-video! overflow-hidden bg-slate-100">
                                        {activeItem.type === "VIDEO" ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={activeItem.thumbnail!}
                                                alt={activeItem.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={activeItem.file.url}
                                                alt={activeItem.title}
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                    </div>
                                    <CardContent className="p-4!">
                                        <h3 className="font-semibold text-slate-800">{activeItem.title}</h3>
                                    </CardContent>
                                </Card>
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            )}

            {isModalOpen && restaurant?.id && (
                <GalleryItemForm
                    setIsModalOpen={setIsModalOpen}
                    isModalOpen={isModalOpen}
                    restaurantId={restaurant.id}
                    editingItem={editingItem}
                    onClose={handleModalClose}
                />
            )}
        </main>
    );
}