"use client";
import { useEffect, useState, useCallback } from "react";
// 既存の page.tsx からクライアントロジックを段階的に移すための薄いラッパ。
// 初期データは Server Component から受け取り、ここで動的操作や追加フェッチを行う。

export interface PublicPageInitialData {
  products?: any[];
  collections?: any[];
  recipes?: any[];
  user?: any | null;
  tagGroups?: any[];
  tags?: any[];
  theme?: string | null;
}

interface Props {
  initial: PublicPageInitialData;
}

export default function PublicPageClient({ initial }: Props) {
  const [products, setProducts] = useState(initial.products || []);
  const [collections, setCollections] = useState(initial.collections || []);
  const [recipes, setRecipes] = useState(initial.recipes || []);
  const [user, setUser] = useState(initial.user || null);
  const [tags, setTags] = useState(initial.tags || []);
  const [tagGroups, setTagGroups] = useState(initial.tagGroups || []);
  const [theme, setTheme] = useState(initial.theme || null);
  const [loading, setLoading] = useState(false);

  // 追加フェッチやインタラクションが必要ならここに段階的に移植。
  const refreshProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const json = await res.json();
        setProducts(json.products || json || []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // 遅延ロードが必要な追加データがある場合に利用。
  }, []);

  return (
    <main className="public-page">
      <section>
        <h1>Public Page</h1>
        {theme && <p>Theme: {theme}</p>}
        {user && <p>Welcome {user.username || user.name}</p>}
        <button onClick={refreshProducts} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh Products"}
        </button>
      </section>
      <section>
        <h2>Products ({products.length})</h2>
        <ul>
          {products.map((p: any) => (
            <li key={p.id || p.slug}>{p.title || p.name || p.id}</li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Collections ({collections.length})</h2>
        <ul>
          {collections.map((c: any) => (
            <li key={c.id || c.slug}>{c.title || c.name || c.id}</li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Recipes ({recipes.length})</h2>
        <ul>
          {recipes.map((r: any) => (
            <li key={r.id || r.slug}>{r.title || r.name || r.id}</li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Tags ({tags.length})</h2>
        <ul>
          {tags.map((t: any) => (
            <li key={t.id || t.slug}>{t.name || t.title || t.id}</li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Tag Groups ({tagGroups.length})</h2>
        <ul>
          {tagGroups.map((g: any) => (
            <li key={g.id || g.slug}>{g.name || g.title || g.id}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
