import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { X, Leaf } from "lucide-react"

interface Addon {
    name: string
    price: number
}

interface EditItemDialogProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
    newItemName: string
    setNewItemName: (val: string) => void
    newItemPrice: string
    setNewItemPrice: (val: string) => void
    newItemDescription: string
    setNewItemDescription: (val: string) => void
    allergens: string[]
    setAllergens: (val: string[]) => void
    allergenInfo: string
    setAllergenInfo: (val: string) => void
    addons: Addon[]
    setAddons: (val: Addon[]) => void
    isHalal: boolean
    setIsHalal: (val: boolean) => void
    newItemshow_in_quick_menu: boolean
    setNewItemshow_in_quick_menu: (val: boolean) => void
    isUploading: boolean
    updateItemMutation: { isPending: boolean }
    resetForm: () => void
    setSelectedItem: (item: any) => void
}

export default function EditItemDialog({
    isOpen,
    onOpenChange,
    onSubmit,
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
    newItemshow_in_quick_menu,
    setNewItemshow_in_quick_menu,
    isUploading,
    updateItemMutation,
    resetForm,
    setSelectedItem,
}: EditItemDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit Menu Item</DialogTitle>
                        <DialogDescription>Update the menu item details</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Item Name + Price */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="editItemName">Item Name</Label>
                                <Input
                                    id="editItemName"
                                    value={newItemName}
                                    onChange={(e) => setNewItemName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="editItemPrice">Price (€)</Label>
                                <Input
                                    id="editItemPrice"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={newItemPrice}
                                    onChange={(e) => setNewItemPrice(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="editItemDescription">Description (Optional)</Label>
                            <Textarea
                                id="editItemDescription"
                                value={newItemDescription}
                                onChange={(e) => setNewItemDescription(e.target.value)}
                                rows={3}
                            />
                        </div>

                        {/* Allergens */}
                        <div className="space-y-2">
                            <Label>Allergens</Label>
                            <div className="flex flex-wrap gap-2">
                                {["gluten", "dairy", "nuts", "eggs", "soy", "shellfish", "fish"].map((allergen) => (
                                    <Button
                                        key={allergen}
                                        type="button"
                                        variant={allergens.includes(allergen) ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => {
                                            if (allergens.includes(allergen)) {
                                                setAllergens(allergens.filter((a) => a !== allergen))
                                            } else {
                                                setAllergens([...allergens, allergen])
                                            }
                                        }}
                                        className={`capitalize ${allergens.includes(allergen) ? "bg-main-green" : ""}`}
                                    >
                                        {allergen}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Additional allergen info */}
                        <div className="space-y-2">
                            <Label htmlFor="editAllergenInfo">Additional Allergen Information</Label>
                            <Textarea
                                id="editAllergenInfo"
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
                                            const updated = [...addons]
                                            updated[index].name = e.target.value
                                            setAddons(updated)
                                        }}
                                    />
                                    <Input
                                        placeholder="Price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={addon.price}
                                        onChange={(e) => {
                                            const updated = [...addons]
                                            updated[index].price = +e.target.value
                                            setAddons(updated)
                                        }}
                                    />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => {
                                            const updated = [...addons]
                                            updated.splice(index, 1)
                                            setAddons(updated)
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

                        {/* Halal checkbox */}
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="editIsHalal"
                                checked={isHalal}
                                onCheckedChange={(checked) => setIsHalal(checked as boolean)}
                            />
                            <Label htmlFor="editIsHalal" className="flex items-center gap-2">
                                <Leaf className="h-4 w-4 text-green-600" />
                                This item is Halal certified
                            </Label>
                        </div>

                        {/* Quick Menu checkbox */}
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="inQuickMenu"
                                checked={newItemshow_in_quick_menu}
                                onCheckedChange={(checked) => setNewItemshow_in_quick_menu(checked as boolean)}
                            />
                            <Label htmlFor="inQuickMenu" className="flex items-center gap-2">
                                Show this item in Quick Menu
                            </Label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                onOpenChange(false)
                                setSelectedItem(null)
                                resetForm()
                            }}
                            className="hover:opacity-75 h-[40px] cursor-pointer rounded-full font-poppins !px-5"
                            disabled={updateItemMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!newItemName || !newItemPrice || updateItemMutation.isPending}
                            className="hover:opacity-75 !bg-main-blue h-[40px] cursor-pointer rounded-full font-poppins !px-5"
                        >
                            {isUploading ? "Uploading..." : updateItemMutation.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
