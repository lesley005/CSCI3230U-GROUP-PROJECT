async function queryWiki(domain, params, signal) {
  // give each wikimedia request six seconds so a slow response cannot hold up the search indefinitely
  const timeout = AbortSignal.timeout(6000);
  const query = new URLSearchParams({
    action: "query",
    format: "json",
    formatversion: "2",
    origin: "*",
    ...params,
  });

  const response = await fetch(`https://${domain}/w/api.php?${query}`, {
    signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
  });

  if (!response.ok) throw new Error(`Wikimedia request failed (${response.status})`);

  const data = await response.json();
  if (data.error) throw new Error(data.error.info);
  return data.query;
}

// check coordinates so cities with the same name get the right photos
function isSameLocation(city, article) {
  const point = article?.coordinates?.[0];
  if (!point || !city.coordinates) return false;

  return Math.abs(point.lat - city.coordinates.lat) < 0.5
    && Math.abs(point.lon - city.coordinates.lon) < 0.5;
}

function fileKey(title) {
  return title.replaceAll("_", " ").normalize("NFC");
}

// AI-assisted - see AI-USAGE.md #4
export async function addCityArticles(cities, signal) {
  if (!cities.length) return cities;

  const articles = await queryWiki("en.wikipedia.org", {
    titles: [...new Set(cities.map((city) => city.name))].join("|"),
    redirects: "1",
    prop: "coordinates|extracts|pageimages",
    exintro: "1",
    explaintext: "1",
    exsentences: "1",
    exlimit: "max",
    pilimit: "max",
    pilicense: "free",
    pithumbsize: "640",
  }, signal);

  const byTitle = new Map(articles.pages.map((page) => [page.title, page]));
  const aliases = new Map(
    [...(articles.normalized ?? []), ...(articles.redirects ?? [])]
      .map(({ from, to }) => [from, to])
  );

  const matches = cities.map((city) => {
    let title = city.name;
    const seen = new Set();

    // follow wikipedia redirects to find the current article title
    while (aliases.has(title) && !seen.has(title)) {
      seen.add(title);
      title = aliases.get(title);
    }

    const article = byTitle.get(title);
    return isSameLocation(city, article) ? article : null;
  });

  const filenames = [...new Set(matches
    .filter((article) => {
        if (!article?.thumbnail || !article.pageimage) return false;

        // skip svg images and filenames that look like maps
        const name = article.pageimage.replaceAll("_", " ");

        return !/\.svg$/i.test(name)
            && !/\b(map|locator|locatiekaart|carte|karte|harta|plan)\b/i.test(name);
    })
    .map((article) => `File:${article.pageimage}`))];

  // look up the photographer and license before showing each image
  const credits = new Map();

  if (filenames.length) {
    try {
      const files = await queryWiki("commons.wikimedia.org", {
        titles: filenames.join("|"),
        prop: "imageinfo",
        iiprop: "url|extmetadata",
        iiextmetadatafilter: "Artist|LicenseShortName|LicenseUrl",
      }, signal);

      for (const file of files.pages) {
        const info = file.imageinfo?.[0];
        const metadata = info?.extmetadata;
        const author = new DOMParser()
          .parseFromString(metadata?.Artist?.value ?? "", "text/html")
          .body.textContent.trim();
        const license = metadata?.LicenseShortName?.value;
        const licenseUrl = metadata?.LicenseUrl?.value;

        if (author && license && info?.descriptionurl?.startsWith("https://")) {
          credits.set(fileKey(file.title), {
            author,
            authorUrl: info.descriptionurl,
            license,
            licenseUrl: licenseUrl?.startsWith("https://")
              ? licenseUrl
              : info.descriptionurl,
          });
        }
      }
    } catch {
      signal?.throwIfAborted();
      // Keep the article facts if the photo credits are unavailable.
    }
  }

  return cities.map((city, index) => {
    const article = matches[index];
    if (!article) return city;

    const fact = article.extract?.trim();
    const imageCredit = credits.get(fileKey(`File:${article.pageimage}`));

    return {
      ...city,
      ...(fact && {
        description: fact,
        factSource: `https://en.wikipedia.org/?curid=${article.pageid}`,
      }),
      ...(imageCredit && {
        image: article.thumbnail.source,
        imageCredit,
      }),
    };
  });
}