FROM node:18-alpine

WORKDIR /usr/src

COPY . /usr/src

RUN apk update

RUN apk add xsel

ARG REACT_APP_NODE_ADDRESS \
    REACT_APP_DEFAULT_NODES_URL \
    REACT_APP_IPFS_ADDRESS \ 
    REACT_APP_IPFS_GATEWAY_ADDRESS \
    REACT_APP_TESTNET_NFT_CONTRACT_ADDRESS \
    REACT_APP_DEFAULT_CONTRACT_ADDRESS
ENV REACT_APP_NODE_ADDRESS=${REACT_APP_NODE_ADDRESS} \
    REACT_APP_DEFAULT_NODES_URL=${REACT_APP_DEFAULT_NODES_URL} \
    REACT_APP_IPFS_ADDRESS=${REACT_APP_IPFS_ADDRESS} \
    REACT_APP_IPFS_GATEWAY_ADDRESS=${REACT_APP_IPFS_GATEWAY_ADDRESS} \
    REACT_APP_TESTNET_NFT_CONTRACT_ADDRESS=${REACT_APP_TESTNET_NFT_CONTRACT_ADDRESS} \
    REACT_APP_DEFAULT_CONTRACT_ADDRESS=${REACT_APP_DEFAULT_CONTRACT_ADDRESS}
    
RUN yarn install

RUN yarn build

RUN npm install --global serve

CMD ["serve", "-s", "/usr/src/build"]
