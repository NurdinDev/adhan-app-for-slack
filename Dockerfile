FROM public.ecr.aws/lambda/nodejs:latest as node

FROM node as build

# Create app directory
# WORKDIR /tmp/build
# Install app dependencies
# COPY package.json yarn.lock ./
# RUN ls -a

# RUN yarn install --frozen-lockfile

# COPY . .

# RUN yarn build

RUN npm i -g yarn

COPY ./ ${LAMBDA_TASK_ROOT}

RUN \
    yarn --frozen-lockfile && \
    yarn build

RUN yarn --frozen-lockfile --production

# FROM base as builder

# Create app directory
# WORKDIR /usr/src/app

# # Install app dependencies
# COPY package.json yarn.lock ./

# RUN yarn install --production --frozen-lockfile

# COPY --from=base /usr/src/app/build ./build


FROM node as runtime

ENV NODE_ENV production
ENV TZ utc

# Create app directory
WORKDIR ${LAMBDA_TASK_ROOT}

COPY --from=build ${LAMBDA_TASK_ROOT}/node_modules/ ${LAMBDA_TASK_ROOT}/node_modules/
COPY --from=build ${LAMBDA_TASK_ROOT}/build ${LAMBDA_TASK_ROOT}


CMD [ "handler.handler" ]