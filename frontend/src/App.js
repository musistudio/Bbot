import './App.css';
import 'animate.css';
import Header from './Layout/header';
import Album from './components/album';

function App(props) {
  return (
    <div className="App">
      <Header />
      <Album />
    </div>
  );
}

export default App;
