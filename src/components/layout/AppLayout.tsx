import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { BottomNav } from './BottomNav'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-6 md:px-6 md:pb-10">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
