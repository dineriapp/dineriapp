import prisma from '@/lib/prisma';
import StoryLineClientSide from './client';

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  let storyLine = await prisma.storyLine.findFirst({
    where: {
      restaurant_id: id
    }
  })

  if (!storyLine) {
    // Creating a default vision row
    const newStoryLine = await prisma.storyLine.create({
      data: {
        restaurant_id: id,
        title: "",
        description: ""
      }
    })
    storyLine = newStoryLine
  }
  return (
    <StoryLineClientSide storyLine={storyLine} restaurntID={id} />
  )
}

export default Page
