FROM ubuntu
USER root
COPY entrypoint.sh /entrypoint.sh
RUN apt update
RUN apt -y install curl gnupg wget unzip
RUN curl -sL https://deb.nodesource.com/setup_20.x  | bash -
RUN chmod +x /entrypoint.sh
RUN apt -y install nodejs
RUN npm install npm@latest -g
RUN npm i -g @bubblewrap/cli
ENTRYPOINT ["/entrypoint.sh"]