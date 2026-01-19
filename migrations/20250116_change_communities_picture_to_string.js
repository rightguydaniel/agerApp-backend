module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      "ALTER TABLE Communities MODIFY COLUMN picture VARCHAR(255) NULL;"
    );
  },
  async down(queryInterface) {
    await queryInterface.sequelize.query(
      "ALTER TABLE Communities MODIFY COLUMN picture LONGBLOB NULL;"
    );
  },
};
