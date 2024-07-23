import dayjs from "dayjs";
import React from "react";

const sampleMagText = `Lorem ipsum dolor sit amet consectetur adipisicing elit. Dicta facere
          enim accusamus quia quos at vitae voluptas repudiandae necessitatibus
          inventore dolore architecto.`;

const MagPost = ({
  img = "https://picsum.photos/100/100",
  channelName = "Anantara Jouneys",
  postTitle = "Edition 1",
  magImage="https://picsum.photos/100/100",
  magText = sampleMagText,
  genre='Travel',
  date=Date.now(),
  messages='865',
}) => {
  return (
    <div className="px-5 m-2 rounded-lg shadow-md">
      <div className="flex flex-row justify-between">
        <div className="flex flex-row justify-start items-center">
          <img src={img} alt="pic" className="m-2 rounded size-6" />
          <div className="text-sm font-bold">Anantara Jouneys, Edition 1</div>
        </div>
        <div className="flex flex-row items-end space-x-5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="text-gray-400 size-6"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M16 12a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2m-6 0a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2m-6 0a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2"
            />
          </svg>
          <svg
            className="text-gray-400 size-6"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="m17 18l-5-2.18L7 18V5h10m0-2H7a2 2 0 0 0-2 2v16l7-3l7 3V5a2 2 0 0 0-2-2"
            />
          </svg>
        </div>
      </div>
      <div className="divide-y-2 divide-gray-600"></div>
      <div className="flex flex-row items-start">
        <img
          src={magImage}
          className="m-2 rounded shadow-2xl size-30"
          alt=""
        />
        <div className="p-3 text-sm">
          {magText}
        </div>
      </div>
      <div className="flex flex-row justify-between pb-3">
        <div className="flex flex-row justify-start items-center">
          <div className="text-gray-600">{genre} • {dayjs(date).format('MMM YYYY')}</div>
          <div className="flex flex-row justify-center items-end">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mx-2 text-gray-400 size-4"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2m0 14H5.2L4 17.2V4h16zm-9 8h2v-2h-2zm-4 0h2v-2H7zm8 0h2v-2h-2z"
              />
            </svg>
            <div className="text-sm text-gray-400">{messages}</div>
          </div>
        </div>
        <div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="text-gray-400 size-6"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M12 21.5c-1.35-.85-3.8-1.5-5.5-1.5c-1.65 0-3.35.3-4.75 1.05c-.1.05-.15.05-.25.05c-.25 0-.5-.25-.5-.5V6c.6-.45 1.25-.75 2-1c1.11-.35 2.33-.5 3.5-.5c1.95 0 4.05.4 5.5 1.5c1.45-1.1 3.55-1.5 5.5-1.5c1.17 0 2.39.15 3.5.5c.75.25 1.4.55 2 1v14.6c0 .25-.25.5-.5.5c-.1 0-.15 0-.25-.05c-1.4-.75-3.1-1.05-4.75-1.05c-1.7 0-4.15.65-5.5 1.5m-1-14c-1.36-.6-3.16-1-4.5-1c-1.2 0-2.4.15-3.5.5v11.5c1.1-.35 2.3-.5 3.5-.5c1.34 0 3.14.4 4.5 1zM13 19c1.36-.6 3.16-1 4.5-1c1.2 0 2.4.15 3.5.5V7c-1.1-.35-2.3-.5-3.5-.5c-1.34 0-3.14.4-4.5 1z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default MagPost;
