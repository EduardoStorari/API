const { hash, compare } = require("bcryptjs");
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
    const { name, email, password, old_password } = request.body;
    const { id } = request.params;
    const database = await sqliteConection();
    const user = await database.get("SELECT * from users WHERE id = (?)", [id]);

    if (!user) {
      throw new AppError("Usuário não encontrado");
    }
    //select para verificar se o email já está cadastrado
    const userWithUpdateEmail = await database.get(
      "SELECT * FROM users WHERE email = (?)",
      [email]
    );
      //tratamento de erro caso o usuário cria com um email que já está cadastrado
    if (userWithUpdateEmail && userWithUpdateEmail.id !== user.id) {
      throw new AppError("Este e-mail já esta está em uso.");
    }
    user.name = name ?? user.name;
    user.email = email ?? user.email;
    //tratamento de erro para mudar a senha
    if (password && !old_password){
      throw new AppError("Você precisa informar a senha antiga para mudar a senha para uma nova");
    }

    if (password && old_password){
      const checkOldPassword = await compare(old_password, user.password);

      if(!checkOldPassword){
        throw new AppError ("A senha antiga não confere");
      }

      user.password = await hash (password, 8);
    }
    //atualizando dados do usuário
    await database.run(
    `UPDATE users SET
    name = ?,
    email = ?,
    password = ?,
    updated_at = DATETIME('now')
    WHERE id = ?`,
      [user.name, user.email, user.password, id]
    );

    return response.json();
  }
}

module.exports = UsersController;
