import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog"; // adjust paths
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus } from "lucide-react";

interface AddCategoryDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    restaurantId?: string | number;

    // state from parent
    categoryName: string;
    setCategoryName: (val: string) => void;
    categoryDescription: string;
    setCategoryDescription: (val: string) => void;
    showInQuickMenu: boolean;
    setShowInQuickMenu: (val: boolean) => void;

    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    isPending?: boolean;
}

const AddCategoryDialog: React.FC<AddCategoryDialogProps> = ({
    isOpen,
    onOpenChange,
    restaurantId,
    categoryName,
    setCategoryName,
    categoryDescription,
    setCategoryDescription,
    showInQuickMenu,
    setShowInQuickMenu,
    onSubmit,
    onCancel,
    isPending = false,
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button
                    size="lg"
                    disabled={!restaurantId}
                    className="flex items-center gap-2 cursor-pointer hover:opacity-75 !bg-main-blue rounded-full !px-5 font-poppins h-[42px]"
                >
                    <Plus className="h-4 w-4" />
                    Add Category
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>Add Menu Category</DialogTitle>
                        <DialogDescription>
                            Create a new category for your menu items
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Category Name</Label>
                            <Input
                                id="name"
                                value={categoryName}
                                onChange={(e) => setCategoryName(e.target.value)}
                                placeholder="e.g. Appetizers"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Textarea
                                id="description"
                                value={categoryDescription}
                                onChange={(e) => setCategoryDescription(e.target.value)}
                                placeholder="Add a description for this category"
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="showQuickMenu">Show in Quick Menu</Label>
                            <p className="text-sm text-muted-foreground">
                                Enable this category to appear in the quick menu.
                            </p>
                            <Switch
                                id="showQuickMenu"
                                checked={showInQuickMenu}
                                onCheckedChange={setShowInQuickMenu}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            className="hover:opacity-75 cursor-pointer rounded-full h-[40px] font-poppins !px-5"
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!categoryName || isPending || !restaurantId}
                            className="hover:opacity-75 !bg-main-blue cursor-pointer h-[40px] rounded-full font-poppins !px-5"
                        >
                            {isPending ? "Adding..." : "Add Category"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddCategoryDialog;
