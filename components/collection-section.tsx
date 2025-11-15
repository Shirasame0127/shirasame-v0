import { ProductCard } from "@/components/product-card"
import type { Product } from "@/lib/mock-data/products"
import type { Collection } from "@/lib/mock-data/collections"

interface CollectionSectionProps {
  collection: Collection
  products: Product[]
}

export function CollectionSection({ collection, products }: CollectionSectionProps) {
  if (products.length === 0) return null

  return (
    <section className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-balance">{collection.title}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
