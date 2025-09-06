import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
    Zap,
    MessageSquare,
    Timer,
    Star,
    MapPinIcon,
    Clock,
    Phone,
    Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { PopupFormData, RestaurantWithCount } from "@/types";

interface WelcomePopupGenericProps {
    prefix: "menu" | "welcome"; // can extend for other cases
    title: string;
    description: string;
    formData: any; // type can be stricter if you want
    setFormData: React.Dispatch<React.SetStateAction<PopupFormData>>;
    handlePopupInfoChange: (key: string, checked: boolean) => void;
    selectedRestaurant?: RestaurantWithCount;
}

export const WelcomePopupCardGeneric: React.FC<WelcomePopupGenericProps> = ({
    prefix,
    title,
    description,
    formData,
    setFormData,
    handlePopupInfoChange,
    selectedRestaurant,
}) => {
    const enabledKey = `${prefix}_popup_enabled`;
    const messageKey = `${prefix}_popup_message`;
    const delayKey = `${prefix}_popup_delay`;
    const buttonKey = `${prefix}_popup_show_button`;
    const infoKey = `${prefix}_popup_show_info`;

    return (
        <Card className="pt-0 box-shad-every-2 shadow-md border-gray-200">
            <CardHeader className="bg-gray-50/50 py-4 font-poppins">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                    <Zap className="h-5 w-5 text-emerald-600" />
                    {title}
                </CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
                {/* Enable/Disable Toggle */}
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label className="text-base">Enable Welcome Popup</Label>
                        <p className="text-sm text-muted-foreground">
                            Show a welcome popup to new visitors
                        </p>
                    </div>
                    <Switch
                        checked={formData[enabledKey]}
                        onCheckedChange={(checked) =>
                            setFormData((prev: any) => ({
                                ...prev,
                                [enabledKey]: checked,
                            }))
                        }
                    />
                </div>

                {formData[enabledKey] && (
                    <>
                        {/* Custom Message */}
                        <div className="space-y-2">
                            <Label htmlFor={`${prefix}-popup-message`} className="flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                Welcome Message
                            </Label>
                            <Textarea
                                id={`${prefix}-popup-message`}
                                value={formData[messageKey]}
                                onChange={(e) =>
                                    setFormData((prev: any) => ({
                                        ...prev,
                                        [messageKey]: e.target.value,
                                    }))
                                }
                                placeholder="Welcome! We're excited to have you visit us."
                                rows={3}
                                maxLength={200}
                                className="focus:border-emerald-500 focus:ring-emerald-500"
                            />
                            <div className="text-right text-xs text-muted-foreground">
                                {formData[messageKey]?.length}/200 characters
                            </div>
                        </div>

                        {/* Timing Control */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Timer className="h-4 w-4" />
                                Show Delay
                            </Label>
                            <Select
                                value={formData[delayKey].toString()}
                                onValueChange={(value) =>
                                    setFormData((prev: any) => ({
                                        ...prev,
                                        [delayKey]: Number.parseInt(value),
                                    }))
                                }
                            >
                                <SelectTrigger className="focus:border-emerald-500 focus:ring-emerald-500 w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((seconds) => (
                                        <SelectItem key={seconds} value={seconds.toString()}>
                                            {seconds} second{seconds > 1 ? "s" : ""}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                How long to wait before showing the popup
                            </p>
                        </div>

                        {/* Show Button Toggle */}
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Show Action Button</Label>
                                <p className="text-sm text-muted-foreground">
                                    Display the &quot;Explore&quot; button in the popup
                                </p>
                            </div>
                            <Switch
                                checked={formData[buttonKey]}
                                onCheckedChange={(checked) =>
                                    setFormData((prev: any) => ({
                                        ...prev,
                                        [buttonKey]: checked,
                                    }))
                                }
                            />
                        </div>

                        {/* Information Display Options */}
                        <div className="space-y-4">
                            <Label className="text-base">Show Information</Label>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { key: "ratings", icon: <Star className="h-4 w-4" />, label: "Ratings" },
                                    { key: "address", icon: <MapPinIcon className="h-4 w-4" />, label: "Address" },
                                    { key: "hours", icon: <Clock className="h-4 w-4" />, label: "Opening Hours" },
                                    { key: "phone", icon: <Phone className="h-4 w-4" />, label: "Phone Number" },
                                ].map(({ key, icon, label }) => (
                                    <div key={key} className="flex items-center space-x-2">
                                        <Switch
                                            id={`${prefix}-show-${key}`}
                                            checked={formData[infoKey][key]}
                                            onCheckedChange={(checked) =>
                                                handlePopupInfoChange(key, checked)
                                            }
                                        />
                                        <Label htmlFor={`${prefix}-show-${key}`} className="flex items-center gap-2">
                                            {icon}
                                            {label}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Live Preview */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Eye className="h-4 w-4" />
                                Preview
                            </Label>
                            <div className="rounded-lg border bg-muted/50 p-4">
                                <div className="mx-auto max-w-sm overflow-hidden rounded-xl bg-white shadow-lg">
                                    <div className="p-6 text-center">
                                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600">
                                            <span className="text-2xl font-bold text-white">
                                                {selectedRestaurant?.name?.charAt(0) || "R"}
                                            </span>
                                        </div>
                                        <h3 className="mb-2 text-lg font-bold">
                                            Welcome to {selectedRestaurant?.name || "Your Restaurant"}!
                                        </h3>
                                        <p className="mb-4 text-sm text-gray-600">
                                            {formData[messageKey]}
                                        </p>
                                        <div className="space-y-2 text-xs text-gray-500">
                                            {formData[infoKey].ratings && selectedRestaurant?.average_rating && (
                                                <div className="flex items-center justify-center gap-1">
                                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                    <span>
                                                        {selectedRestaurant.average_rating.toFixed(1)} ({selectedRestaurant.review_count} reviews)
                                                    </span>
                                                </div>
                                            )}
                                            {formData[infoKey].address && selectedRestaurant?.address && (
                                                <div className="flex items-center justify-center gap-1">
                                                    <MapPinIcon className="h-3 w-3" />
                                                    <span>{selectedRestaurant.address.split(",")[0]}</span>
                                                </div>
                                            )}
                                            {formData[infoKey].hours && (
                                                <div className="flex items-center justify-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    <span>Open Today</span>
                                                </div>
                                            )}
                                            {formData[infoKey].phone && selectedRestaurant?.phone && (
                                                <div className="flex items-center justify-center gap-1">
                                                    <Phone className="h-3 w-3" />
                                                    <span>{selectedRestaurant.phone}</span>
                                                </div>
                                            )}
                                        </div>
                                        {formData[buttonKey] && (
                                            <Button
                                                size="sm"
                                                className="mt-4 bg-emerald-600 hover:bg-emerald-700"
                                            >
                                                Explore
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                This is how your welcome popup will appear to visitors
                            </p>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
};
