"use client";

import get from "@/app/utils/get";
import { Box, Spinner, Link, IconButton } from "@chakra-ui/react";
import React, {
  useState,
  Fragment,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import useSWR from "swr";
import { Menu, Transition } from "@headlessui/react";
import {
  ChevronDownIcon,
  CheckIcon,
  DotsCircleHorizontalIcon,
  StarIcon,
} from "@heroicons/react/solid";

import { StarIcon as StarIconOutlined } from "@heroicons/react/outline";

const pinChannel = (id) =>
  get(`channel/pinChannel/${id}`, true, { method: "PUT" }).then((r) => r.data);
const unpinChannel = (id) =>
  get(`channel/unpinChannel/${id}`, true, { method: "PUT" }).then(
    (r) => r.data
  );

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const options = {
  Pinned: "Pinned",
  Recent: "Recent",
  AZ: "A - Z",
  ByGenre: "By Genre",
};

function ViewBy({ view, setView, mutate }) {
  return (
    <>
      <Menu as="div">
        <div>
          <Menu.Button className="inline-flex justify-center px-4 py-2 w-full text-sm font-medium text-white rounded-md bg-black/20 hover:bg-black/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75">
            View By
            <ChevronDownIcon
              className="-mr-1 ml-2 w-5 h-5 text-gray-400 hover:text-violet-100"
              aria-hidden="true"
            />
          </Menu.Button>
        </div>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items
            onChange={(e) => console.log("menu", e.target)}
            className="absolute right-0 mt-2 w-56 bg-white rounded-md divide-y divide-gray-100 ring-1 shadow-lg origin-top-right ring-black/5 focus:outline-none"
          >
            {Object.values(options).map((option) => (
              <div key={option} className="px-1 py-1">
                <Menu.Item>
                  {({ hover }) => (
                    <button
                      className={`${
                        hover ? "text-white bg-gray-500" : "text-gray-900"
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                      onClick={() => {
                        setView(option);

                        mutate(
                          (followings) => followings.toSorted(sortFn(option)),
                          { revalidate: false }
                        );
                      }}
                    >
                      {view === option ? (
                        <CheckIcon
                          className="mr-2 w-5 h-5"
                          aria-hidden="true"
                        />
                      ) : (
                        <div className="mr-2 w-5 h-5" aria-hidden="true">
                          &nbsp;
                        </div>
                      )}
                      {option}
                    </button>
                  )}
                </Menu.Item>
              </div>
            ))}
          </Menu.Items>
        </Transition>
      </Menu>
    </>
  );
}

const sortFn = (view) => {
  switch (view) {
    case options.Pinned:
      return (a, b) => !!b?.pinned - !!a?.pinned;
    case options.ByGenre:
      return (a, b) => +(a?.genre > b?.genre);
    case options.Recent:
      return (a, b) => new Date(b?.createdAt) - new Date(a?.createdAt);
    case options.AZ:
      return (a, b) => a?.channelName.localeCompare(b?.channelName);
  }
};

const Following = () => {
  const [view, setView] = useState(options.Pinned);
  const {
    data: followings = [{}],
    isLoading: followingLoading,
    mutate,
  } = useSWR(
    "channel/followChannelList",
    (k) =>
      get(k, true).then((r) =>
        r.data
          .filter((i) => i.channelId)
          .map((i) => ({ ...i.channelId, pinned: i.pinned }))
          .toSorted(sortFn(options.Pinned))
      )
    // {
    //   revalidateOnFocus: false,
    // }
  );

  const { data: user = {} } = useSWR(
    `users/getUser/${localStorage.getItem("userId")}`,
    (k) => get(k, true).then((r) => r.user)
  );

  return (
    <Box>
      <div className="divide-y-2">
        <div
          className="flex flex-row justify-between items-center pr-6 my-4 rounded shadow"
          style={{ background: user.profileBgColor }}
        >
          <div className="flex flex-row justify-start items-center px-2 space-x-3">
            <div className="flex flex-col justify-end items-end">
              <img
                src={user.profileImageUrl || "https://picsum.photos/100/100"}
                alt=""
                className="m-2 rounded-md size-16"
              />
            </div>
            <div>
              <div className="font-bold">{user.channelName}</div>
              <div className="-mt-1 font-normal text-gray-400">
                {Array.isArray(user.genre) &&
                  user.genre.toSorted().slice(0, -2).join(", ") +
                    user.genre.toSorted().slice(-2).join(" & ")}
              </div>
            </div>
          </div>
          <div>
            <IconButton
              aria-label="Menu"
              colorScheme={user.profileBgColor}
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-gray-400 size-6"
                  viewBox="0 0 24 24"
                >
                  <title>Menu</title>
                  <path
                    fill="currentColor"
                    d="M16 12a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2m-6 0a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2m-6 0a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2"
                  />
                </svg>
              }
            />
          </div>
        </div>

        <div className="flex justify-end items-center pr-6 space-x-2.5 group py-1">
          <div className="font-bold capitalize">
            <ViewBy view={view} setView={setView} mutate={mutate} />
          </div>
        </div>
        {followingLoading && <Spinner />}
        {followings?.map?.((following) => (
          <div
            key={following._id}
            className="flex flex-row justify-between items-center pr-6 transition-shadow hover:shadow hover:bg-gray-50 transition-color"
          >
            <div className="flex flex-row justify-start items-center px-2 my-2 space-x-3">
              <IconButton
                aria-label="Pin Channel"
                colorScheme={user.profileBgColor}
                onClick={() => {
                  following.pinned
                    ? unpinChannel(following._id).then(() => {
                        mutate(
                          followings
                            .map((i) =>
                              i._id === following._id
                                ? { ...following, pinned: false }
                                : i
                            )
                            .toSorted(sortFn(view)), {revalidate: false}
                        );
                      })
                    : pinChannel(following._id).then(() => {
                        mutate(
                          followings
                            .map((i) =>
                              i._id === following._id
                                ? { ...following, pinned: true }
                                : i
                            )
                            .toSorted(sortFn(view))
                        , {revalidate: false});
                      });
                }}
                icon={
                  following.pinned ? (
                    <StarIcon className="text-green-500 size-6" />
                  ) : (
                    <StarIconOutlined className="text-gray-400 size-6" />
                  )
                }
              />
              <div className="flex flex-col justify-end items-end">
                <img
                  src={
                    following?.channelIconImageUrl ||
                    "https://picsum.photos/100/100"
                  }
                  alt=""
                  className="rounded-md size-12"
                />
                <span className="z-10 -mt-4 flex rounded-xl bg-black px-1.5 py-0.5 text-xs text-white">
                  ...
                </span>
              </div>
              <div>
                <Link href={`/channel/${following._id}`}>
                  <div className="font-bold">{following?.channelName}</div>
                </Link>
                <div className="font-light">
                  {Array.isArray(following?.genre) &&
                    following?.genre?.join?.(" - ")}
                </div>
              </div>
            </div>
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="text-gray-400 size-6"
                viewBox="0 0 24 24"
              >
                <title>Icon</title>
                <path
                  fill="currentColor"
                  d="M16 12a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2m-6 0a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2m-6 0a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2"
                />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </Box>
  );
};

export default Following;
