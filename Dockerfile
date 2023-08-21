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
    REACT_APP_DEFAULT_TESTNET_CONTRACT_ADDRESS \
    REACT_APP_DEFAULT_CONTRACT_ADDRESS
ENV REACT_APP_NODE_ADDRESS=${REACT_APP_NODE_ADDRESS} \
    REACT_APP_DEFAULT_NODES_URL=${REACT_APP_DEFAULT_NODES_URL} \
    REACT_APP_IPFS_ADDRESS=${REACT_APP_IPFS_ADDRESS} \
    REACT_APP_IPFS_GATEWAY_ADDRESS=${REACT_APP_IPFS_GATEWAY_ADDRESS} \
    REACT_APP_TESTNET_NFT_CONTRACT_ADDRESS=${REACT_APP_TESTNET_NFT_CONTRACT_ADDRESS} \
    REACT_APP_DEFAULT_TESTNET_CONTRACT_ADDRESS=${REACT_APP_DEFAULT_TESTNET_CONTRACT_ADDRESS} \
    REACT_APP_DEFAULT_CONTRACT_ADDRESS=${REACT_APP_DEFAULT_CONTRACT_ADDRESS} \
    DISABLE_ESLINT_PLUGIN=true

# Install dependencies based on the preferred package manager
RUN \
if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
elif [ -f package-lock.json ]; then npm ci; \
elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i; \
else echo "Lockfile not found." && exit 1; \
fi

RUN yarn build

RUN npm install --global serve

CMD ["serve", "-s", "/usr/src/build"]
