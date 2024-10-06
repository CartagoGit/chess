FROM node:22

ARG PROJECT
RUN echo "Project: ${PROJECT}"

# Actualiza los repositorios y instala zsh
RUN apt-get update && \
    apt-get install -y zsh && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

SHELL [ "/bin/zsh", "-c" ]



# Instalar Bun
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:$PATH"

# Instalar nvm
ENV NVM_DIR="/root/.nvm"
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# Cargar NVM para su uso
# Este script se asegura de que NVM esté disponible en el contenedor
RUN echo "export NVM_DIR=\"$NVM_DIR\"" >> /root/.bashrc && \
    echo "[ -s \"$NVM_DIR/nvm.sh\" ] && . \"$NVM_DIR/nvm.sh\"" >> /root/.bashrc

# Instalar Angular cli, nvm y yarn
RUN bun i -g @angular/cli@^18.0.0 yarn

# Configura Angular CLI para usar Bun como gestor de paquetes
RUN ng config --global cli.packageManager bun

RUN ng version


# Configuracion para zsh

# Añade el contenido de bash en zsh
RUN echo 'source /root/.bashrc' > /root/.zshrc
# Instala oh-my-zsh
RUN sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

# Instala eza
# RUN curl -sSfL https://raw.githubusercontent.com/eza-community/eza/main/install.sh | sh
RUN apt update \
    && apt install -y gpg \
    && mkdir -p /etc/apt/keyrings \
    && wget -qO- https://raw.githubusercontent.com/eza-community/eza/main/deb.asc | gpg --dearmor -o /etc/apt/keyrings/gierens.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/gierens.gpg] http://deb.gierens.de stable main" | tee /etc/apt/sources.list.d/gierens.list \
    && chmod 644 /etc/apt/keyrings/gierens.gpg /etc/apt/sources.list.d/gierens.list \
    && apt update \
    && apt install -y eza

# Instala Powerlevel10k
RUN git clone --depth=1 https://github.com/romkatv/powerlevel10k.git "$HOME/.oh-my-zsh/themes/powerlevel10k"

# Instala los plugins de oh-my-zsh manualmente
RUN git clone https://github.com/zsh-users/zsh-autosuggestions "$HOME/.oh-my-zsh/custom/plugins/zsh-autosuggestions" && \
    git clone https://github.com/zsh-users/zsh-completions "$HOME/.oh-my-zsh/custom/plugins/zsh-completions" && \
    git clone https://github.com/zsh-users/zsh-syntax-highlighting.git "$HOME/.oh-my-zsh/custom/plugins/zsh-syntax-highlighting"




RUN ln -sf /bin/zsh /bin/sh

ENTRYPOINT ["/bin/zsh", "-c"]
CMD ["tail -f /dev/null"]
