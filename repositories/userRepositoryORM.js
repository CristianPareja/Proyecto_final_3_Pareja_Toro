const User = require("../models/User");

class UserRepositoryORM {
  async findById(id) {
    return await User.findByPk(id);
  }

  async findByUsername(username) {
    return await User.findOne({ where: { username } });
  }

  async create(userData) {
    return await User.create(userData);
  }
}

module.exports = new UserRepositoryORM();
