import app from "./app.js";
import { setupDatabase } from './config/initDb.js';

const PORT = process.env.PORT || 10000;

setupDatabase().then(() => { 
  console.log("banco de dados sincronizado");
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log("server rodando na porta", PORT);
});