const { userService } = require('../services');

const getUsers = async (req, res) => {
    const users = await userService.getUsers();
    // json
    // res.send(result);

    // view
    res.render(
        'user', 
        { 
            users 
        }
    );
};
  
module.exports = {
    getUsers,
};