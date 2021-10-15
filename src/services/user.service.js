const model = require('../models');

// speard operator for retrieve user model
const { User } = model;

const getUsers = async () => {
    // var users = await User.findAll({ raw: true }); This method for pretty result 

    var users = await User.findAll();
    return users;
}

module.exports = {
    getUsers,
}