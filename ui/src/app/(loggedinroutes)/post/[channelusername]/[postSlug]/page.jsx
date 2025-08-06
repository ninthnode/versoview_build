import React from "react";
import { getDashboardMetadata } from "@/app/utils/metadata";
import Post from "./Post";
import axios from 'axios';
import { getExcerptText } from "@/app/utils/GetExcerpt";

export async function generateMetadata({ params }) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/post/getPostByIdLoggedOut/${params.id}`, {
      cache: 'no-store', // or 'force-cache' or 'no-cache' depending on your need
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch post: ${res.status}`);
    }

    const { data } = await res.json();

    const body = getExcerptText(data.bodyRichText, 50).replace(/<\/?[^>]+(>|$)/g, "");

    return getDashboardMetadata(
      data.header,
      data.standFirst || body,
      data.mainImageURL
    );
  } catch (error) {
    console.error("Metadata generation error:", error);
    return {
      title: "Post Not Found",
      description: "The post you're looking for does not exist.",
    };
  }
}

function PostLayout({params}){
  
  return( <Post params={params}/>);
}

export default PostLayout