export async function getDashboardMetadata(title,description,image) {
  const data = {
    userName: title||"Versoview",
    description: description||"Versoview",
    image:image||
      "https://versoview-post-images.s3.us-east-1.amazonaws.com/public/test/image/image-1733298496201.png",
  };
  return {
    title: data.userName,
    description: data.description,
    openGraph: {
      title: data.userName,
      description: data.description,
      url: process.env.NEXT_PUBLIC_FRONTEND_URL,
      images: [
        {
          url:
            data.image ||
            "https://versoview-post-images.s3.us-east-1.amazonaws.com/public/test/image/image-1733298496201.png",
          width: 1200,
          height: 630,
          alt: "Versoview",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: data.userName,
      description: data.description,
      images: [
        data.image ||
          "https://versoview-post-images.s3.us-east-1.amazonaws.com/public/test/image/image-1733298496201.png",
      ],
    },
  };
}
