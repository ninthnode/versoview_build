import get from "@/app/utils/get";
import token from "@/app/utils/token";
import { Spinner } from "@chakra-ui/react";
import axios from "axios";
import React from "react";
import useSWR from "swr";

const follow = (id) =>
  axios
    .post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/channel/followChannel/${id}`,
      { status: "active" },
      {
        headers: {
          authorization: token(),
        },
      }
    )
    .then((r) => r.data);

const FollowBtn = ({ channelId, refetchFollowers }) => {
  const {
    data: following = {},
    mutate,
    isLoading: isFollowingLoading,
  } = useSWR(`channel/getFollowChannel/${channelId}`, (k) =>
    get(k, true).then((r) => r.data)
  );

  const isFollowed = following?.channelId === channelId;

  return isFollowingLoading ? (
    <Spinner />
  ) : (
    <button
      type="button"
      onClick={async () => {
        isFollowed
          ? await get(`channel/unfollowChannel/${channelId}`, true, {
              method: "DELETE",
            }).then(() => {
              mutate();
              refetchFollowers();
            })
          : await follow(channelId).then((r) => {
              console.log("Follow button clicked", r.data);
              mutate({ ...following });
            });
      }}
      className={`"px-8 ${isFollowed && "text-green-500"} rounded-lg border-2 ${
        isFollowed && "border-green-500"
      }`}
    >
      {isFollowed ? "Following" : "Follow"}
    </button>
  );
};

const About = ({
  channelIconImageUrl,
  profileTitle,
  channelName,
  about,
  url,
  profileBgColor: backgroundColor,
  _id,
  postsCount= 0,
  followersCount = 0,
  followingCount = 0,
  refetchFollowers,
}) => {
  return (
    <div
      className="container flex flex-row p-3 min-w-full bg-gray-100 rounded"
      style={{ backgroundColor }}
    >
      <div className="flex flex-col justify-between">
        <div>
          <img
            src={channelIconImageUrl}
            className="rounded-md size-16"
            alt="Channel"
          />
        </div>

        <div className="flex flex-col justify-between items-center">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-6"
              viewBox="0 0 24 24"
            >
              <title>Message</title>
              <path
                fill="currentColor"
                d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2m0 14H5.2L4 17.2V4h16z"
              />
            </svg>
          </div>
          <div className="text-xs capitalize">Message</div>
        </div>
      </div>

      <div className="container ml-4">
        <div className="flex flex-row justify-between items-start">
          <div className="flex flex-col">
            <div className="font-bold">{profileTitle}</div>
            <div className="-mt-1 font-semibold">{channelName}</div>
          </div>
          <FollowBtn channelId={_id} refetchFollowers={refetchFollowers} />
        </div>

        <div className="py-2 w-4/5 text-sm">
          {about}
          <br />
          <a
            href={url}
            className="text-xs italic underline hover:text-blue-800"
          >
            {url}
          </a>
        </div>

        <div className="flex flex-row space-x-8">
          <div className="flex flex-col items-center">
            <div className="font-bold">{postsCount ?? 0}</div>
            <div className="text-xs">Posts</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="font-bold">0</div>
            <div className="text-xs">Editions</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="font-bold">{followingCount ?? 0}</div>
            <div className="text-xs">Following</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="font-bold">{followersCount ?? 0}</div>
            <div className="text-xs">Followers</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
