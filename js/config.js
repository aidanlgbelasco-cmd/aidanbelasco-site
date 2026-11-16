// AidanBelasco.com settings. Change things here, not in the pages.
window.AB = {
  // Where the Shopify store lives. Switch to "https://shop.aidanbelasco.com"
  // on the day AidanBelasco.com is pointed at this site.
  shopBase: "https://aidanbelasco.com",

  // Where quote requests are sent. Aidan chooses this address.
  quoteEmail: "aidanlgbelasco@gmail.com",

  // Shown on the Hire page for calls and texts. Digits only.
  phone: "2015613516",

  youtube: "https://www.youtube.com/@AidanBelasco",
  instagram: "https://www.instagram.com/aidanbelasco.fitness/",

  // Short films shown at the top of the Watch page. Leave empty and the section stays hidden.
  // id = the part after "watch?v=" (or after youtu.be/) in the film's YouTube link.
  films: [
    // { id: "XXXXXXXXXXX", title: "Film title" }
  ],

  // The Watch page videos come from js/videos.js, which tools/update_videos.py
  // rewrites with the channel's 10 newest long-form videos.
  // Pulled from Shopify on 2026-11-16. Rebuild when prices or products change.
  products: [
    { line: "Chase Your Dreams", name: "Hoodie", handle: "chase-your-dreams-hoodie", from: 50, img: "cyd-hoodie", opts: "4 colors · S–3XL" },
    { line: "Chase Your Dreams", name: "Tee",    handle: "chase-your-dreams-tee",    from: 38, img: "cyd-tee",    opts: "4 colors · XS–3XL" },
    { line: "Chase Your Dreams", name: "Beanie", handle: "chase-your-dreams-beanie", from: 25, img: "cyd-beanie", opts: "Black · one size", flat: true },
    { line: "Against All Odds",  name: "Hoodie", handle: "against-all-odds-hoodie",  from: 50, img: "aao-hoodie", opts: "4 colors · S–3XL" },
    { line: "Against All Odds",  name: "Tee",    handle: "against-all-odds-tee",     from: 38, img: "aao-tee",    opts: "4 colors · XS–3XL" },
    { line: "Against All Odds",  name: "Beanie", handle: "against-all-odds-beanie",  from: 25, img: "aao-beanie", opts: "Black · one size", flat: true }
  ]
};
