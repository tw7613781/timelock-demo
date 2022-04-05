import { useEffect, useState } from 'react';
import { message } from 'antd';
import './App.css';
import { getConn } from './conn';

function App() {

  const [conn, setConn] = useState();
  
  useEffect(() => {
    async function fetchData() {
      try { 
        const _conn = await getConn();
        if (_conn) {
          setConn(_conn);
        }
      } catch (err) {
        message.error(err);
      }
    }
    fetchData();
  }, [conn]);
  
  return (
    <div className="App">
    </div>
  );
}

export default App;
