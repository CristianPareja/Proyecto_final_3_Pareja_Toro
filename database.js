const { Sequelize } = require("sequelize")

const sequelize= new Sequelize('ecocanje_db', 'postgres', 'postgres',{
    host: 'localhost',
    dialect: 'postgres',
    port: 5435,
    logging: true
})

sequelize.authenticate()
    .then(()=>console.log('coneccion exitosa'))
    .catch(err => console.log(`error de coneccion: ${err}`))

module.exports= sequelize