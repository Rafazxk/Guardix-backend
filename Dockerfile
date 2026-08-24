# Usa uma imagem oficial do Node.js
FROM node:18

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala as dependências do Node
RUN npm install

# Copia o restante do código do projeto
COPY . .

# Cria a pasta de uploads (caso não exista no git)
RUN mkdir -p uploads

# Define a porta (O Render passará isso automaticamente)
EXPOSE 10000

# Comando para iniciar o servidor
CMD ["node", "src/server.js"]