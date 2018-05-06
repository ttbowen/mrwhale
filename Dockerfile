FROM alpine:edge

# Install nodejs and npm
RUN apk add --update nodejs nodejs-npm

# Create app directory
WORKDIR /usr/src/mrwhale

COPY package*.json ./

# Install dependencies 
RUN apk add --update --no-cache \
    alpine-sdk \
    sqlite \
    python2 \
    ffmpeg

RUN mkdir db

RUN npm install

# Bundle app source
COPY . .

CMD [ "npm", "start" ]