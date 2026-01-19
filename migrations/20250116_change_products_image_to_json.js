module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      "ALTER TABLE Products MODIFY COLUMN image JSON NULL;"
    );
  },
  async down(queryInterface) {
    await queryInterface.sequelize.query(
      "ALTER TABLE Products MODIFY COLUMN image VARCHAR(255) NULL;"
    );
  },
};
