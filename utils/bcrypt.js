const bcrypt = require('bcrypt');

const encryptPassword = async (password) => {
    const encryption = await bcrypt.hash(password, 10);
    console.log('ENCRYPTED:', encryption)
    return encryption;
}

const comparePassAndHash = async (password, hash) => {
    const comparison = await bcrypt.compare(password.toString(), hash);
    console.log('COMPARISON:', comparison);
    return comparison;
}

module.exports = {
    encryptPassword,
    comparePassAndHash
}