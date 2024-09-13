import { combineReducers } from 'redux';
import authReducer from './auth/authReducer';
import postReducer from './posts/postReducer';
import commentReducer from './comments/commentReducer';
import bookmarkReducer from './bookmarks/bookmarkReducer';
import channelReducer from './channel/channelReducer';
import profileReducer from './profile/reducer';
import publishReducer from './publish/publishReducer';
import titleReducer from './navbar/reducer';

const rootReducer = combineReducers({
  auth: authReducer,
  post:postReducer,
  comment:commentReducer,
  bookmark:bookmarkReducer,
  channel:channelReducer,
  profile:profileReducer,
  publish:publishReducer,
  navtitle:titleReducer
});

export default rootReducer;