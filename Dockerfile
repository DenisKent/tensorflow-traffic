FROM jupyter/tensorflow-notebook

WORKDIR $HOME


EXPOSE 8888

RUN python3 -m pip install tensorflow==1.13.0rc1
RUN python3 -m pip install opencv-python
RUN python3 -m pip install keras
RUN python3 -m pip install imageai --upgrade

COPY . .

# $ docker cp a464f9d2bcce:/. ./copy

# docker run -p 8888:8888 --mount type=bind,source="$(pwd)"/volume,target=/home/jovyan/volume aecdf741292a
