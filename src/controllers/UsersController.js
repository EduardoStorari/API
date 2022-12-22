const { hash } = require("bcryptjs");
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
  async update(request, response) {
    const { name, email } = request.body;
    const { id } = request.params;
    console.log(id);
    const database = await sqliteConection();
    const user = await database.get("SELECT * from users WHERE id = (?)", [id]);

    if (!user) {
      throw new AppError("Usuário não encontrado");
    }

    const userWithUpdateEmail = await database.get(
      "SELECT * FROM users WHERE email = (?)",
      [email]
    );

    if (userWithUpdateEmail && userWithUpdateEmail.id !== user.id) {
      throw new AppError("Este e-mail já esta está em uso.");
    }
    user.name = name;
    user.email = email;

    await database.run(
    `UPDATE users SET
    name = ?,
    email = ?,
    updated_at = ?
    WHERE id = ?`,
      [user.name, user.email, new Date(), id]
    );

    return response.json();
  }
}

module.exports = UsersController;
