const {hash} = require ("bcryptjs");
const AppError = require("../utils/AppError");
const sqliteConection = require("../database/sqlite");

class UsersController {
  //criando usuário
  async create(request, response) {
    const { name, email, password } = request.body;

    const database = await sqliteConection();
    const checkUserExist = await database.get(
      "SELECT * FROM users WHERE email = (?)",
      [email]
    );

    if (checkUserExist) {
      throw new AppError("Este e-mail já está em uso.");
    }

    const hashedPassword = await hash(password, 8);

    await database.run(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );

    return response.status(201).json();
  }
  async update(request, response){
    const {name, email} = requeste.body;
    const { id } = request.params;

    const database = await sqliteConection();
    const user = await database.get("SELECT * from users WHERE id = (?)", [id]);
    
    if(user) {
      throw new AppError ("Usuário não encontrado")
    }
  }
}

module.exports = UsersController;
