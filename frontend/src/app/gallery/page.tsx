import { contentRoute } from '@/components/content/content-route'

const route = contentRoute('gallery')

// Gallery items are fetched separately and change without a publish.
export const revalidate = 60

export const generateMetadata = route.generateMetadata
export default route.Page
