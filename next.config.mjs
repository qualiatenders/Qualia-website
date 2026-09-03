/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  /*
   * Statische export: `next build` schrijft een map out/ met kant-en-klare
   * HTML, CSS en JS. Er draait op de server niets meer — geschikt voor
   * gewone webhosting zoals TransIP, waar geen Node.js beschikbaar is.
   */
  output: 'export',

  /*
   * Elke route wordt als map/index.html weggeschreven (/assault-500/ ->
   * out/assault-500/index.html). Apache serveert dat direct; zonder deze
   * instelling zou hij out/assault-500.html moeten raden en 404 geven.
   * Meteen ook één schrijfwijze van elke URL, dus geen duplicate content.
   */
  trailingSlash: true,

  images: {
    /*
     * Zonder Node.js-server kan Next geen beelden op maat maken, dus de
     * bestanden uit public/images/ worden ongewijzigd geserveerd. De
     * opmaak verandert hier niet van: het formaat op het scherm wordt
     * door de CSS bepaald, niet door deze instelling.
     */
    unoptimized: true,
  },
};

export default nextConfig;
