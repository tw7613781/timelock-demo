import { useEffect, useState } from 'react';
import { message, List, Typography, Divider } from 'antd';
import { utils, Contract } from 'ethers';

const { Paragraph } = Typography;

const ABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"burn","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"mint","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}];

function Contracts({conn}) {

    const [addr, setAddr] = useState();
    const [name, setName] = useState();
    const [symbol, setSymbol] = useState();
    const [owner, setOwner] = useState();
    const [totalSupply, setTotalSupply] = useState();

    useEffect(() => {
        async function fetchData() {
        try { 
            await getTokenInfo();
        } catch (err) {
                message.error(err);
            }
        }
        fetchData();
        return () => {
            resetState();
        }
    }, [conn]);

    const getToken = () => {
        if (conn) {
            return new Contract('0x1ADabbb86ae76b1B74874DC207b3ec695Ff4B3AD', ABI, conn.getSigner());
        }
    }

    const resetState = () => {
        setAddr();
        setName();
        setSymbol();
        setOwner();
        setTotalSupply();
    }

    const getTokenInfo = async () => {
        const token = getToken();
        if (!token) return;

        setAddr(token.address);
        const _name = await token.name();
        if (_name) setName(_name);
        const _symbol = await token.symbol();
        if (_symbol) setSymbol(_symbol);
        const _owner = await token.owner();
        if (_owner) setOwner(_owner);
        const _totalSupply = await token.totalSupply();
        if (_totalSupply) setTotalSupply(utils.formatEther(_totalSupply));
    }

    const listData = [
        {
            title: 'Address',
            value: addr,
            copy: true
        },
        {
            title: 'Name',
            value: name
        },
        {
            title: 'Symbol',
            value: symbol
        },
        {
            title: 'Owner',
            value: owner,
            copy: true
        },
        {
            title: 'Total Supply',
            value: totalSupply
        },
    ]

    return (
        <div className="container">
            <Divider orientation="left">
                TestToken Contract
            </Divider>
            <List
                dataSource={listData}
                bordered
                grid={{ column: 2 }}
                renderItem={item => 
                    (<List.Item key={item.title}>
                        { item.copy &&               
                            <Paragraph copyable={{ text: item.value}}>{item.title}: {item.value}</Paragraph>
                        }
                        { !item.copy &&
                            <p>{item.title}: {item.value}</p> 
                        }
                    </List.Item>)}
            />
        </div>
    );
}

export default Contracts;