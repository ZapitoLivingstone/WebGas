import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { HeroSection } from "@/components/home/hero-section"
import { FeaturedProducts } from "@/components/home/featured-products"
import { CategoriesSection } from "@/components/home/categories-section"
import { ConfigurationWarning } from "@/components/configuration-warning"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <ConfigurationWarning />
      <main className="flex-1">
        <HeroSection />
        <CategoriesSection />
        <FeaturedProducts />
      </main>
      <Footer />
    </div>
  )
}
