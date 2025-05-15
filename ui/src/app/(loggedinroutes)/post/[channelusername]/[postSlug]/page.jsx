import React from "react";
import { getDashboardMetadata } from "@/app/utils/metadata";
import Post from "./Post";
import axios from 'axios';
import { getExcerptText } from "@/app/utils/GetExcerpt";

export async function generateMetadata({params}) {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/post/getPostByIdLoggedOut/${params.id}`);
    let data = response.data.data.post
    let body = getExcerptText(data.bodyRichText, 50).replace(/<\/?[^>]+(>|$)/g, "");
    return await getDashboardMetadata(data.header,data.standFirst || body,data.mainImageURL);
  } catch (error) {
    console.log(error)
  }
}
function PostLayout({params}){
  
  return( <Post params={params}/>);
}

export default PostLayout