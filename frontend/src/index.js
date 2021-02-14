import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import reducer from './reducers';
import './index.css';
import WebSocketClient from './utils/socket';
import Speaker from './utils/speaker';


const Handler = {
  speaker: new Speaker(),
}



const ws = new WebSocketClient('ws://localhost:3000', data => {
  console.log('接受到数据', data)
  const { handler, app, data: app_data } = data;
  Handler[app] && Handler[app][handler] && typeof Handler[app][handler] === 'function' && Handler[app][handler](app_data);
});
const store = createStore(reducer);


void async function() {
  ReactDOM.render(
    <React.StrictMode>
      <Provider store={store}>
        <App socket={ws}/>
      </Provider>
    </React.StrictMode>,
    document.getElementById('root')
  );  
}()


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
