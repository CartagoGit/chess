FROM node:22

ARG PROJECT
RUN echo "Project: ${PROJECT}"

# Instalar Bun
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:$PATH"

# Instalar nvm
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
RUN export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")" && \
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
ENV PATH=

# Instalar Angular cli, nvm y yarn
RUN bun i -g @angular/cli@^18.0.0 yarn

# Configura Angular CLI para usar Bun como gestor de paquetes
RUN ng config --global cli.packageManager bun

RUN ng version

CMD ["tail", "-f", "/dev/null"]

