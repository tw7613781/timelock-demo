import { useEffect, useState } from 'react';
import { message, Layout } from 'antd';
import './App.css';
import { getConn } from './conn';
import Token from './token';

const { Footer, Content } = Layout;

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
        <>
            <Layout>
                <Content>
                    <Token conn={conn}></Token>
                </Content>
                <Footer style={{ textAlign: 'center' }}>Timelock Demo ©2022</Footer>
            </Layout>
        </>
    );
}

export default App;
