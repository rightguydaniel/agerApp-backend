module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      "ALTER TABLE Customers MODIFY COLUMN email VARCHAR(255) NULL;"
    );
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      "ALTER TABLE Customers MODIFY COLUMN email VARCHAR(255) NOT NULL;"
    );
  },
};
