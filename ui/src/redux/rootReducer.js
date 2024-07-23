import { combineReducers } from 'redux';
import authReducer from './auth/authReducer';
import postReducer from './posts/postReducer';
import commentReducer from './comments/commentReducer';
import bookmarkReducer from './bookmarks/bookmarkReducer';

const rootReducer = combineReducers({
  auth: authReducer,
  post:postReducer,
  comment:commentReducer,
  bookmark:bookmarkReducer
});

export default rootReducer;