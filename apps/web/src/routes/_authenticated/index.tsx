import { createFileRoute } from '@tanstack/react-router'
import { HomeScreen } from '@/home/components/HomeScreen'

export const Route = createFileRoute('/_authenticated/')({
  component: HomeScreen,
})
