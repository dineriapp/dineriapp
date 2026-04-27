import { Loader } from "lucide-react"

const Loading = () => {
    return (
        <div className="w-full min-h-[50dvh] flex items-center justify-center">
            <Loader size={24} className="animate-spin" />
        </div>
    )
}

export default Loading
