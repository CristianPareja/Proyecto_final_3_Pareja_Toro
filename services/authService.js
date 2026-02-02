const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userRepository = require("../repositories/userRepositoryORM");

class AuthService {
  async register(data) {
    if (!data) throw { status: 400, message: "Body vacío" };

    const { username, password } = data;

    if (!username || !password) {
      throw { status: 400, message: "Fields missing (username, password)" };
    }

    if (typeof username !== "string" || username.trim().length < 3) {
      throw { status: 400, message: "Username must be at least 3 characters" };
    }

    if (typeof password !== "string" || password.length < 6) {
      throw { status: 400, message: "Password must be at least 6 characters" };
    }

    const existing = await userRepository.findByUsername(username.trim());
    if (existing) throw { status: 400, message: "Username already exists" };

    const password_hash = await bcrypt.hash(password, 10);

    const user = await userRepository.create({
      username: username.trim(),
      password_hash,
    });

    return { id: user.id, username: user.username };
  }

  async login(data) {
    if (!data) throw { status: 400, message: "Body vacío" };

    const { username, password } = data;

    if (!username || !password) {
      throw { status: 400, message: "Fields missing (username, password)" };
    }

    const user = await userRepository.findByUsername(username.trim());
    if (!user) throw { status: 401, message: "Invalid credentials" };

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) throw { status: 401, message: "Invalid credentials" };

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    return {
      message: "Login successful",
      token,
      user: { id: user.id, username: user.username },
    };
  }
}

module.exports = new AuthService();
