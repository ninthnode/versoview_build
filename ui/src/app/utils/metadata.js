export async function getDashboardMetadata(title, description, image, url) {
  const data = {
    title: title || "Versoview",
    description: description || "Versoview",
    image: image || "https://versoview-post-images.s3.us-east-1.amazonaws.com/public/test/image/image-1733298496201.png",
    url: url || process.env.NEXT_PUBLIC_FRONTEND_URL,
  };
  return {
    title: data.title,
    description: data.description,
    openGraph: {
      title: data.title,
      description: data.description,
      url: data.url,
      siteName: "Versoview",
      images: [
        {
          url: data.image,
          width: 1600,
          height: 900,
          alt: data.title,
          type: 'image/jpeg',
        },
      ],
      type: "article",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: data.title,
      description: data.description,
      images: [data.image],
      creator: "@versoview",
      site: "@versoview",
    },
    metadataBase: new URL(process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://versoview.com'),
  };
}
