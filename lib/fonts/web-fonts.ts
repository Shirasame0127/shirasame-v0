export type WebFont = {
  name: string
  family: string
  category: 'japanese' | 'english'
  weights: number[]
  googleFontUrl: string
}

export const WEB_FONTS: WebFont[] = [
  // ===========================
  // 日本語対応フォント（50種類）
  // ===========================
  {
    name: 'Noto Sans JP',
    family: "'Noto Sans JP', sans-serif",
    category: 'japanese',
    weights: [300, 400, 500, 700],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap'
  },
  {
    name: 'Noto Serif JP',
    family: "'Noto Serif JP', serif",
    category: 'japanese',
    weights: [400, 700],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;700&display=swap'
  },
  {
    name: 'M PLUS 1p',
    family: "'M PLUS 1p', sans-serif",
    category: 'japanese',
    weights: [300, 400, 500, 700],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=M+PLUS+1p:wght@300;400;500;700&display=swap'
  },
  {
    name: 'M PLUS Rounded 1c',
    family: "'M PLUS Rounded 1c', sans-serif",
    category: 'japanese',
    weights: [300, 400, 500, 700],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@300;400;500;700&display=swap'
  },
  {
    name: 'Kosugi Maru',
    family: "'Kosugi Maru', sans-serif",
    category: 'japanese',
    weights: [400],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Kosugi+Maru&display=swap'
  },
  {
    name: 'Kosugi',
    family: "'Kosugi', sans-serif",
    category: 'japanese',
    weights: [400],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Kosugi&display=swap'
  },
  {
    name: 'Sawarabi Gothic',
    family: "'Sawarabi Gothic', sans-serif",
    category: 'japanese',
    weights: [400],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Sawarabi+Gothic&display=swap'
  },
  {
    name: 'Sawarabi Mincho',
    family: "'Sawarabi Mincho', serif",
    category: 'japanese',
    weights: [400],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Sawarabi+Mincho&display=swap'
  },
  {
    name: 'Zen Kaku Gothic New',
    family: "'Zen Kaku Gothic New', sans-serif",
    category: 'japanese',
    weights: [300, 400, 500, 700],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Zen+Kaku+Gothic+New:wght@300;400;500;700&display=swap'
  },
  {
    name: 'Zen Maru Gothic',
    family: "'Zen Maru Gothic', sans-serif",
    category: 'japanese',
    weights: [300, 400, 500, 700],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@300;400;500;700&display=swap'
  },
  {
    name: 'Zen Old Mincho',
    family: "'Zen Old Mincho', serif",
    category: 'japanese',
    weights: [400, 700],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Zen+Old+Mincho:wght@400;700&display=swap'
  },
  {
    name: 'Shippori Mincho',
    family: "'Shippori Mincho', serif",
    category: 'japanese',
    weights: [400, 500, 700],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@400;500;700&display=swap'
  },
  {
    name: 'Shippori Mincho B1',
    family: "'Shippori Mincho B1', serif",
    category: 'japanese',
    weights: [400, 700],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Shippori+Mincho+B1:wght@400;700&display=swap'
  },
  {
    name: 'Klee One',
    family: "'Klee One', cursive",
    category: 'japanese',
    weights: [400, 700],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Klee+One:wght@400;700&display=swap'
  },
  {
    name: 'Yusei Magic',
    family: "'Yusei Magic', sans-serif",
    category: 'japanese',
    weights: [400],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Yusei+Magic&display=swap'
  },
  {
    name: 'Stick',
    family: "'Stick', sans-serif",
    category: 'japanese',
    weights: [400],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Stick&display=swap'
  },
  {
    name: 'Potta One',
    family: "'Potta One', cursive",
    category: 'japanese',
    weights: [400],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Potta+One&display=swap'
  },
  {
    name: 'Train One',
    family: "'Train One', cursive",
    category: 'japanese',
    weights: [400],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Train+One&display=swap'
  },
  {
    name: 'Hachi Maru Pop',
    family: "'Hachi Maru Pop', cursive",
    category: 'japanese',
    weights: [400],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Hachi+Maru+Pop&display=swap'
  },
  {
    name: 'RocknRoll One',
    family: "'RocknRoll One', sans-serif",
    category: 'japanese',
    weights: [400],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=RocknRoll+One&display=swap'
  },
  {
    name: 'Reggae One',
    family: "'Reggae One', cursive",
    category: 'japanese',
    weights: [400],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Reggae+One&display=swap'
  },
  {
    name: 'DotGothic16',
    family: "'DotGothic16', sans-serif",
    category: 'japanese',
    weights: [400],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=DotGothic16&display=swap'
  },
  {
    name: 'Rampart One',
    family: "'Rampart One', cursive",
    category: 'japanese',
    weights: [400],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Rampart+One&display=swap'
  },
  {
    name: 'Yomogi',
    family: "'Yomogi', cursive",
    category: 'japanese',
    weights: [400],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Yomogi&display=swap'
  },
  {
    name: 'Dela Gothic One',
    family: "'Dela Gothic One', cursive",
    category: 'japanese',
    weights: [400],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Dela+Gothic+One&display=swap'
  },
  {
    name: 'Kaisei Decol',
    family: "'Kaisei Decol', serif",
    category: 'japanese',
    weights: [400, 700],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Kaisei+Decol:wght@400;700&display=swap'
  },
  {
    name: 'Kaisei Opti',
    family: "'Kaisei Opti', serif",
    category: 'japanese',
    weights: [400, 700],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Kaisei+Opti:wght@400;700&display=swap'
  },
  {
    name: 'Kaisei Tokumin',
    family: "'Kaisei Tokumin', serif",
    category: 'japanese',
    weights: [400, 700],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Kaisei+Tokumin:wght@400;700&display=swap'
  },
  {
    name: 'Murecho',
    family: "'Murecho', sans-serif",
    category: 'japanese',
    weights: [300, 400, 700],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Murecho:wght@300;400;700&display=swap'
  },
  {
    name: 'BIZ UDGothic',
    family: "'BIZ UDGothic', sans-serif",
    category: 'japanese',
    weights: [400, 700],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=BIZ+UDGothic:wght@400;700&display=swap'
  },
  {
    name: 'BIZ UDMincho',
    family: "'BIZ UDMincho', serif",
    category: 'japanese',
    weights: [400, 700],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=BIZ+UDMincho:wght@400;700&display=swap'
  },
  {
    name: 'IBM Plex Sans JP',
    family: "'IBM Plex Sans JP', sans-serif",
    category: 'japanese',
    weights: [300, 400, 500, 700],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+JP:wght@300;400;500;700&display=swap'
  },
  {
    name: 'Mochiy Pop One',
    family: "'Mochiy Pop One', sans-serif",
    category: 'japanese',
    weights: [400],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Mochiy+Pop+One&display=swap'
  },
  {
    name: 'Mochiy Pop P One',
    family: "'Mochiy Pop P One', sans-serif",
    category: 'japanese',
    weights: [400],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Mochiy+Pop+P+One&display=swap'
  },
  {
    name: 'New Tegomin',
    family: "'New Tegomin', serif",
    category: 'japanese',
    weights: [400],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=New+Tegomin&display=swap'
  },
  {
    name: 'Palette Mosaic',
    family: "'Palette Mosaic', cursive",
    category: 'japanese',
    weights: [400],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Palette+Mosaic&display=swap'
  },
  {
    name: 'Kiwi Maru',
    family: "'Kiwi Maru', serif",
    category: 'japanese',
    weights: [300, 400, 500],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Kiwi+Maru:wght@300;400;500&display=swap'
  },
  {
    name: 'Tsukimi Rounded',
    family: "'Tsukimi Rounded', sans-serif",
    category: 'japanese',
    weights: [300, 400, 700],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Tsukimi+Rounded:wght@300;400;700&display=swap'
  },
  {
    name: 'Slackside One',
    family: "'Slackside One', cursive",
    category: 'japanese',
    weights: [400],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Slackside+One&display=swap'
  },
  {
    name: 'Zen Kurenaido',
    family: "'Zen Kurenaido', sans-serif",
    category: 'japanese',
    weights: [400],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Zen+Kurenaido&display=swap'
  },
  {
    name: 'Zen Antique',
    family: "'Zen Antique', serif",
    category: 'japanese',
    weights: [400],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Zen+Antique&display=swap'
  },
  {
    name: 'Yuji Syuku',
    family: "'Yuji Syuku', serif",
    category: 'japanese',
    weights: [400],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Yuji+Syuku&display=swap'
  },
  {
    name: 'Yuji Boku',
    family: "'Yuji Boku', serif",
    category: 'japanese',
    weights: [400],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Yuji+Boku&display=swap'
  },
  {
    name: 'Yuji Mai',
    family: "'Yuji Mai', serif",
    category: 'japanese',
    weights: [400],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Yuji+Mai&display=swap'
  },
  {
    name: 'Shizuru',
    family: "'Shizuru', cursive",
    category: 'japanese',
    weights: [400],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Shizuru&display=swap'
  },
  {
    name: 'Yujihentaigana',
    family: "'Yujihentaigana', cursive",
    category: 'japanese',
    weights: [400],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Yujihentaigana&display=swap'
  },
  {
    name: 'Cherry Bomb One',
    family: "'Cherry Bomb One', cursive",
    category: 'japanese',
    weights: [400],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Cherry+Bomb+One&display=swap'
  },
  {
    name: 'Shippori Antique',
    family: "'Shippori Antique', serif",
    category: 'japanese',
    weights: [400],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Shippori+Antique&display=swap'
  },
  {
    name: 'Shippori Antique B1',
    family: "'Shippori Antique B1', serif",
    category: 'japanese',
    weights: [400],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Shippori+Antique+B1&display=swap'
  },
  {
    name: 'Hina Mincho',
    family: "'Hina Mincho', serif",
    category: 'japanese',
    weights: [400],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Hina+Mincho&display=swap'
  },

  // ===========================
  // 英語のみフォント（50種類）
  // ===========================
  {
    name: 'Roboto',
    family: "'Roboto', sans-serif",
    category: 'english',
    weights: [300, 400, 500, 700],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap'
  },
  {
    name: 'Open Sans',
    family: "'Open Sans', sans-serif",
    category: 'english',
    weights: [300, 400, 600, 700],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700&display=swap'
  },
  {
    name: 'Lato',
    family: "'Lato', sans-serif",
    category: 'english',
    weights: [300, 400, 700],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap'
  },
  {
    name: 'Montserrat',
    family: "'Montserrat', sans-serif",
    category: 'english',
    weights: [300, 400, 600, 700],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;700&display=swap'
  },
  {
    name: 'Oswald',
    family: "'Oswald', sans-serif",
    category: 'english',
    weights: [300, 400, 600, 700],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;600;700&display=swap'
  },
  {
    name: 'Raleway',
    family: "'Raleway', sans-serif",
    category: 'english',
    weights: [300, 400, 600, 700],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;600;700&display=swap'
  },
  {
    name: 'Poppins',
    family: "'Poppins', sans-serif",
    category: 'english',
    weights: [300, 400, 600, 700],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap'
  },
  {
    name: 'Playfair Display',
    family: "'Playfair Display', serif",
    category: 'english',
    weights: [400, 700],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap'
  },
  {
    name: 'Merriweather',
    family: "'Merriweather', serif",
    category: 'english',
    weights: [300, 400, 700],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700&display=swap'
  },
  {
    name: 'Source Sans Pro',
    family: "'Source Sans Pro', sans-serif",
    category: 'english',
    weights: [300, 400, 600, 700],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@300;400;600;700&display=swap'
  },
  {
    name: 'PT Sans',
    family: "'PT Sans', sans-serif",
    category: 'english',
    weights: [400, 700],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap'
  },
  {
    name: 'Ubuntu',
    family: "'Ubuntu', sans-serif",
    category: 'english',
    weights: [300, 400, 500, 700],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Ubuntu:wght@300;400;500;700&display=swap'
  },
  {
    name: 'Nunito',
    family: "'Nunito', sans-serif",
    category: 'english',
    weights: [300, 400, 600, 700],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;600;700&display=swap'
  },
  {
    name: 'Inter',
    family: "'Inter', sans-serif",
    category: 'english',
    weights: [300, 400, 600, 700],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap'
  },
  {
    name: 'Work Sans',
    family: "'Work Sans', sans-serif",
    category: 'english',
    weights: [300, 400, 600, 700],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Work+Sans:wght@300;400;600;700&display=swap'
  },
  {
    name: 'Rubik',
    family: "'Rubik', sans-serif",
    category: 'english',
    weights: [300, 400, 600, 700],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;600;700&display=swap'
  },
  {
    name: 'Lora',
    family: "'Lora', serif",
    category: 'english',
    weights: [400, 700],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Lora:wght@400;700&display=swap'
  },
  {
    name: 'DM Sans',
    family: "'DM Sans', sans-serif",
    category: 'english',
    weights: [400, 500, 700],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap'
  },
  {
    name: 'Manrope',
    family: "'Manrope', sans-serif",
    category: 'english',
    weights: [300, 400, 600, 700],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;600;700&display=swap'
  },
  {
    name: 'Barlow',
    family: "'Barlow', sans-serif",
    category: 'english',
    weights: [300, 400, 600, 700],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;600;700&display=swap'
  },
  {
    name: 'Josefin Sans',
    family: "'Josefin Sans', sans-serif",
    category: 'english',
    weights: [300, 400, 600, 700],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@300;400;600;700&display=swap'
  },
  {
    name: 'Quicksand',
    family: "'Quicksand', sans-serif",
    category: 'english',
    weights: [300, 400, 600, 700],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;600;700&display=swap'
  },
  {
    name: 'Bitter',
    family: "'Bitter', serif",
    category: 'english',
    weights: [400, 700],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Bitter:wght@400;700&display=swap'
  },
  {
    name: 'Cabin',
    family: "'Cabin', sans-serif",
    category: 'english',
    weights: [400, 600, 700],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Cabin:wght@400;600;700&display=swap'
  },
  {
    name: 'Crimson Text',
    family: "'Crimson Text', serif",
    category: 'english',
    weights: [400, 700],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Crimson+Text:wght@400;700&display=swap'
  },
  {
    name: 'Archivo',
    family: "'Archivo', sans-serif",
    category: 'english',
    weights: [300, 400, 600, 700],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Archivo:wght@300;400;600;700&display=swap'
  },
  {
    name: 'Karla',
    family: "'Karla', sans-serif",
    category: 'english',
    weights: [300, 400, 600, 700],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Karla:wght@300;400;600;700&display=swap'
  },
  {
    name: 'Spectral',
    family: "'Spectral', serif",
    category: 'english',
    weights: [400, 700],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Spectral:wght@400;700&display=swap'
  },
  {
    name: 'Libre Baskerville',
    family: "'Libre Baskerville', serif",
    category: 'english',
    weights: [400, 700],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&display=swap'
  },
  {
    name: 'Titillium Web',
    family: "'Titillium Web', sans-serif",
    category: 'english',
    weights: [300, 400, 600, 700],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Titillium+Web:wght@300;400;600;700&display=swap'
  },
  {
    name: 'Fira Sans',
    family: "'Fira Sans', sans-serif",
    category: 'english',
    weights: [300, 400, 600, 700],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Fira+Sans:wght@300;400;600;700&display=swap'
  },
  {
    name: 'Space Grotesk',
    family: "'Space Grotesk', sans-serif",
    category: 'english',
    weights: [300, 400, 600, 700],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;600;700&display=swap'
  },
  {
    name: 'Bebas Neue',
    family: "'Bebas Neue', cursive",
    category: 'english',
    weights: [400],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap'
  },
  {
    name: 'Anton',
    family: "'Anton', sans-serif",
    category: 'english',
    weights: [400],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Anton&display=swap'
  },
  {
    name: 'Pacifico',
    family: "'Pacifico', cursive",
    category: 'english',
    weights: [400],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Pacifico&display=swap'
  },
  {
    name: 'Dancing Script',
    family: "'Dancing Script', cursive",
    category: 'english',
    weights: [400, 700],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap'
  },
  {
    name: 'Caveat',
    family: "'Caveat', cursive",
    category: 'english',
    weights: [400, 700],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&display=swap'
  },
  {
    name: 'Righteous',
    family: "'Righteous', cursive",
    category: 'english',
    weights: [400],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Righteous&display=swap'
  },
  {
    name: 'Lobster',
    family: "'Lobster', cursive",
    category: 'english',
    weights: [400],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Lobster&display=swap'
  },
  {
    name: 'Permanent Marker',
    family: "'Permanent Marker', cursive",
    category: 'english',
    weights: [400],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap'
  },
  {
    name: 'Indie Flower',
    family: "'Indie Flower', cursive",
    category: 'english',
    weights: [400],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Indie+Flower&display=swap'
  },
  {
    name: 'Shadows Into Light',
    family: "'Shadows Into Light', cursive",
    category: 'english',
    weights: [400],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Shadows+Into+Light&display=swap'
  },
  {
    name: 'Bungee',
    family: "'Bungee', cursive",
    category: 'english',
    weights: [400],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Bungee&display=swap'
  },
  {
    name: 'Comfortaa',
    family: "'Comfortaa', cursive",
    category: 'english',
    weights: [300, 400, 700],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Comfortaa:wght@300;400;700&display=swap'
  },
  {
    name: 'Fredoka One',
    family: "'Fredoka One', cursive",
    category: 'english',
    weights: [400],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap'
  },
  {
    name: 'Patua One',
    family: "'Patua One', cursive",
    category: 'english',
    weights: [400],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Patua+One&display=swap'
  },
  {
    name: 'Satisfy',
    family: "'Satisfy', cursive",
    category: 'english',
    weights: [400],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Satisfy&display=swap'
  },
  {
    name: 'Abril Fatface',
    family: "'Abril Fatface', cursive",
    category: 'english',
    weights: [400],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Abril+Fatface&display=swap'
  },
  {
    name: 'Zilla Slab',
    family: "'Zilla Slab', serif",
    category: 'english',
    weights: [300, 400, 700],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Zilla+Slab:wght@300;400;700&display=swap'
  },
  {
    name: 'Exo 2',
    family: "'Exo 2', sans-serif",
    category: 'english',
    weights: [300, 400, 600, 700],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;600;700&display=swap'
  },
]

export function getFontsByCategory(category: 'japanese' | 'english' | 'all'): WebFont[] {
  if (category === 'all') return WEB_FONTS
  return WEB_FONTS.filter(font => font.category === category)
}

export function getFontByFamily(family: string): WebFont | undefined {
  return WEB_FONTS.find(font => font.family === family)
}
