import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function uploadImage(file: File): Promise<string | null> {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `116andt_0/${Math.random()}/${fileName}`

    const { error } = await supabase.storage.from('dineri-storage').upload(filePath, file)

    if (error) {
        console.error("Image upload failed", error)
        return null
    }
    const { data } = supabase.storage.from('dineri-storage').getPublicUrl(filePath)
    console.log(data.publicUrl)
    return data.publicUrl
}