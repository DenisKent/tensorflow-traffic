FROM node:10

WORKDIR /app


EXPOSE 3000
RUN apt update
RUN apt -y install python3-pip
RUN pip3 --version
RUN python3 -m pip install tensorflow==1.13.0rc1
RUN python3 -m pip install opencv-python
RUN python3 -m pip install keras
RUN python3 -m pip install imageai --upgrade

COPY package* ./
RUN npm install
COPY ./pythonscripts/resnet* ./pythonscripts/
COPY . ./

# $ docker cp a464f9d2bcce:/. ./copy

# docker run -p 8888:8888 --mount type=bind,source="$(pwd)"/volume,target=/app/volume aecdf741292a

# docker run --mount type=bind,source="$(pwd)"/volume,target=/app/volume -it d7cd638ba995 sh
