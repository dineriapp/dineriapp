import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useFormStatus } from "react-dom"

// Submit button component
export function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button
            type="submit"
            className="w-full bg-gradient-to-r h-[44px] from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700"
            disabled={pending}
        >
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                </>
            ) : "Log in"}
        </Button>
    )
}