  // import React from 'react';
  // import { css } from '@emotion/react';
  // import { SyncLoader } from 'react-spinners';

  // const override = css` 
  //   display: block;
  //   margin: 0 auto;
  //   border-color: red;
  // `;

  // const Loader = () => {
  //   return (
  //     <SyncLoader color={'#FFFFFF'} css={override} size={5} />
  //   );
  // };

  // export default Loader;

  import React from 'react';
import { css } from '@emotion/react';
import { SyncLoader, ClipLoader, ScaleLoader, RiseLoader, PropagateLoader } from 'react-spinners';

const override = css` 
  display: block;
  margin: 0 auto;
`;

const Loader = ({ type }) => {
  let LoaderComponent;
  switch (type) {
    case 'sync':
      LoaderComponent = <SyncLoader color={'#FFFFFF'} css={override} size={5} />;
      break;
    case 'clip':
      LoaderComponent = <ClipLoader color={'#FFFFFF'} css={override} size={50} />;
      break;
    case 'clipdark':
      LoaderComponent = <ClipLoader color={'#333'} css={override} size={30} />;
      break;
    case 'scale':
      LoaderComponent = <ScaleLoader color={'#FFFFFF'} css={override} size={150} />;
      break;
    case 'ring':
      LoaderComponent = <RiseLoader color={'#56bedb'} css={override} size={10} />;
      break;
    case 'spinner':
      LoaderComponent = <PropagateLoader color={'#56bedb'} css={override} size={10} />;
      break;
    default:
      LoaderComponent = <SyncLoader color={'#FFFFFF'} css={override} size={5} />;
  }

  return LoaderComponent;
};

export default Loader;

