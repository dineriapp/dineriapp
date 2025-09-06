import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Leaf, X } from "lucide-react";
import React from "react";

export interface Addon {
    name: string;
    price: number;
}

interface AddItemDialogProps {
    open: boolean;
    categoryName?: string;
    newItemName: string;
    setNewItemName: (val: string) => void;
    newItemPrice: string;
    setNewItemPrice: (val: string) => void;
    newItemDescription: string;
    setNewItemDescription: (val: string) => void;
    allergens: string[];
    setAllergens: (val: string[]) => void;
    allergenInfo: string;
    setAllergenInfo: (val: string) => void;
    addons: Addon[];
    setAddons: (val: Addon[]) => void;
    isHalal: boolean;
    setIsHalal: (val: boolean) => void;
    showInQuickMenu: boolean;
    setShowInQuickMenu: (val: boolean) => void;
    isUploading?: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    createItemPending?: boolean;
}

const AddItemDialog: React.FC<AddItemDialogProps> = ({
    open,
    categoryName,
    newItemName,
    setNewItemName,
    newItemPrice,
    setNewItemPrice,
    newItemDescription,
    setNewItemDescription,
    allergens,
    setAllergens,
    allergenInfo,
    setAllergenInfo,
    addons,
    setAddons,
    isHalal,
    setIsHalal,
    showInQuickMenu,
    setShowInQuickMenu,
    isUploading,
    onClose,
    onSubmit,
    createItemPending,
}) => {
    const allergenList = ["gluten", "dairy", "nuts", "eggs", "soy", "shellfish", "fish"];

    return (
        <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>Add Menu Item</DialogTitle>
                        <DialogDescription>Add a new item to {categoryName}</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Name & Price */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="itemName">Item Name</Label>
                                <Input
                                    id="itemName"
                                    value={newItemName}
                                    onChange={(e) => setNewItemName(e.target.value)}
                                    placeholder="e.g. Caesar Salad"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="itemPrice">Price (€)</Label>
                                <Input
                                    id="itemPrice"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={newItemPrice}
                                    onChange={(e) => setNewItemPrice(e.target.value)}
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="itemDescription">Description (Optional)</Label>
                            <Textarea
                                id="itemDescription"
                                value={newItemDescription}
                                onChange={(e) => setNewItemDescription(e.target.value)}
                                placeholder="Add a description for this item"
                                rows={3}
                            />
                        </div>

                        {/* Allergens */}
                        <div className="space-y-2">
                            <Label>Allergens</Label>
                            <div className="flex flex-wrap gap-2">
                                {allergenList.map((allergen) => (
                                    <Button
                                        key={allergen}
                                        type="button"
                                        variant={allergens.includes(allergen) ? "default" : "outline"}
                                        size="sm"
                                        onClick={() =>
                                            allergens.includes(allergen)
                                                ? setAllergens(allergens.filter((a) => a !== allergen))
                                                : setAllergens([...allergens, allergen])
                                        }
                                        className={`capitalize ${allergens.includes(allergen) ? "bg-main-green" : ""}`}
                                    >
                                        {allergen}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Additional Allergen Info */}
                        <div className="space-y-2">
                            <Label htmlFor="allergenInfo">Additional Allergen Information</Label>
                            <Textarea
                                id="allergenInfo"
                                value={allergenInfo}
                                onChange={(e) => setAllergenInfo(e.target.value)}
                                placeholder="Add any additional allergen information"
                                rows={2}
                            />
                        </div>

                        {/* Addons */}
                        <div className="space-y-2">
                            <Label>Addons</Label>
                            {addons.map((addon, index) => (
                                <div key={index} className="grid grid-cols-4 gap-2">
                                    <Input
                                        placeholder="Addon Name (e.g. Extra Cheese)"
                                        value={addon.name}
                                        className="col-span-2"
                                        onChange={(e) => {
                                            const updated = [...addons];
                                            updated[index].name = e.target.value;
                                            setAddons(updated);
                                        }}
                                    />
                                    <Input
                                        placeholder="Price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={addon.price}
                                        onChange={(e) => {
                                            const updated = [...addons];
                                            updated[index].price = +e.target.value;
                                            setAddons(updated);
                                        }}
                                    />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => {
                                            const updated = [...addons];
                                            updated.splice(index, 1);
                                            setAddons(updated);
                                        }}
                                    >
                                        <X size={24} />
                                    </Button>
                                </div>
                            ))}

                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setAddons([...addons, { name: "", price: 0 }])}
                                className="hover:opacity-75 !bg-main-green text-white cursor-pointer rounded-full h-[38px] !text-xs font-poppins !px-4"
                            >
                                + Add Addon
                            </Button>
                        </div>

                        {/* Halal & Quick Menu */}
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="isHalal"
                                checked={isHalal}
                                onCheckedChange={(checked) => setIsHalal(checked as boolean)}
                            />
                            <Label htmlFor="isHalal" className="flex items-center gap-2">
                                <Leaf className="h-4 w-4 text-green-600" />
                                This item is Halal certified
                            </Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="showInQuickMenu"
                                checked={showInQuickMenu}
                                onCheckedChange={(checked) => setShowInQuickMenu(checked as boolean)}
                            />
                            <Label htmlFor="showInQuickMenu" className="flex items-center gap-2">
                                Show this item in Quick Menu
                            </Label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="hover:opacity-75 h-[40px] cursor-pointer rounded-full font-poppins !px-5"
                            disabled={createItemPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!newItemName || !newItemPrice || createItemPending || isUploading}
                            className="hover:opacity-75 !bg-main-blue cursor-pointer rounded-full h-[40px] font-poppins !px-5"
                        >
                            {isUploading ? "Uploading..." : createItemPending ? "Adding..." : "Add Item"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddItemDialog;
