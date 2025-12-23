import React from "react";
import { getDashboardMetadata } from "@/app/utils/metadata";
import Post from "./Post";
import axios from 'axios';
import { getExcerptText } from "@/app/utils/GetExcerpt";

export async function generateMetadata({params}) {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/post/getPostByIdLoggedOut/${params.postSlug}`);
    let data = response.data.data.post
    let body = getExcerptText(data.bodyRichText, 50).replace(/<\/?[^>]+(>|$)/g, "");
    const postUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/post/${params.channelusername}/${params.postSlug}`;
    return await getDashboardMetadata(data.header, data.standFirst || body, data.mainImageURL, postUrl);
  } catch (error) {
    console.log(error)
    return await getDashboardMetadata();
  }
}


function PostLayout({params}){
  
  return( <Post params={params}/>);
}

export default PostLayout