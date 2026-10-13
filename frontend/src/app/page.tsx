import { contentRoute } from '@/components/content/content-route'

const route = contentRoute('home')

export const generateMetadata = route.generateMetadata
export default route.Page
