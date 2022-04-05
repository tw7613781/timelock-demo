import { providers } from 'ethers';

export const getConn = () => {
  return new Promise((resolve, reject) => {
    window.addEventListener('load', async () => {
      if (window && window.ethereum) {
        window.ethereum.on('chainChanged', () => {
          window.location.reload();
        });
        window.ethereum.on('accountsChanged', () => {
          window.location.reload();
        });
        await window.ethereum.enable();
        const provider = new providers.Web3Provider(window.ethereum);
        return resolve(provider);
      } else {
        return reject('Browser extension wallet is not found! The site is not functional!');
      }
    });
  });
}
