import { DialogHeader } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Restaurant } from "@prisma/client";
import { MapPin, Phone, Mail, Instagram, Facebook, MessageCircleMore } from "lucide-react";

interface RestaurantInfoDialogProps {
    restaurant: Restaurant;
}

export function RestaurantInfoDialog({ restaurant }: RestaurantInfoDialogProps) {
    return (
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <DialogHeader className="!gap-0">
                <DialogTitle className="text-xl font-semibold">{restaurant.name}</DialogTitle>
                {restaurant.bio && (
                    <p className="text-[13px] text-gray-700 leading-relaxed border-b pb-2">{restaurant.bio}</p>
                )}
            </DialogHeader>


            <div className="space-y-4 text-sm">
                {restaurant.address && (
                    <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div>
                            <p>{restaurant.address}</p>
                        </div>
                    </div>
                )}

                {restaurant.phone && (
                    <div className="flex items-start gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div>
                            <p>{restaurant.phone}</p>
                        </div>
                    </div>
                )}

                {restaurant.email && (
                    <div className="flex items-start gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div>
                            <p>{restaurant.email}</p>
                        </div>
                    </div>
                )}
            </div>

            {(restaurant.instagram || restaurant.facebook || restaurant.whatsapp) && (
                <div className="border-t pt-3">
                    <p className="text-xs font-semibold text-muted-foreground mb-3">Socials</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                        {restaurant.instagram && (
                            <a
                                href={restaurant.instagram}
                                target="_blank"
                                className="flex items-center gap-1 text-blue-500 hover:underline"
                            >
                                <Instagram className="w-4 h-4" />
                            </a>
                        )}
                        {restaurant.facebook && (
                            <a
                                href={restaurant.facebook}
                                target="_blank"
                                className="flex items-center gap-1 text-blue-600 hover:underline"
                            >
                                <Facebook className="w-4 h-4" />
                            </a>
                        )}
                        {restaurant.whatsapp && (
                            <a
                                href={`https://wa.me/${restaurant.whatsapp}`}
                                target="_blank"
                                className="flex items-center gap-1 text-green-600 hover:underline"
                            >
                                <MessageCircleMore className="w-4 h-4" />
                            </a>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
