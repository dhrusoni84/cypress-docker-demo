FROM cypress/included:15.1.0

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

CMD ["npx", "cypress", "run"]
