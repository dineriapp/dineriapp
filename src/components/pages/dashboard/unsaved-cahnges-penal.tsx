import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RotateCcw, Save } from "lucide-react";

interface UnsavedChangesPanelProps {
    hasChanges: boolean;
    saving: boolean;
    resetForm: () => void;
    saveSettings: () => void;
    UnsavedChangesUi: React.ComponentType;
    ResetChangesBtnClasses?: string;
    SaveChangesBtnClasses?: string;
}

export const UnsavedChangesPanel: React.FC<UnsavedChangesPanelProps> = ({
    hasChanges,
    saving,
    resetForm,
    saveSettings,
    UnsavedChangesUi,
    ResetChangesBtnClasses = "",
    SaveChangesBtnClasses = "",
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{
                opacity: hasChanges ? 1 : 0,
                y: hasChanges ? 0 : 20,
            }}
            className="fixed bottom-4 sm:bottom-8 right-4 sm:right-8 flex items-end sm:items-center sm:flex-row-reverse flex-col gap-2 sm:gap-2"
        >
            <UnsavedChangesUi />
            <div className="flex gap-2">
                <Button
                    onClick={resetForm}
                    disabled={saving || !hasChanges}
                    variant="outline"
                    size="lg"
                    className={ResetChangesBtnClasses}
                >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                </Button>
                <Button
                    onClick={saveSettings}
                    disabled={saving || !hasChanges}
                    size="lg"
                    className={SaveChangesBtnClasses}
                >
                    <Save className="h-4 w-4" />
                    {saving ? "Saving..." : "Save Changes"}
                </Button>
            </div>
        </motion.div>
    );
};
