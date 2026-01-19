module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      "ALTER TABLE Users ADD COLUMN state VARCHAR(255) NULL;"
    );
    await queryInterface.sequelize.query(
      "ALTER TABLE Users ADD COLUMN address VARCHAR(255) NULL;"
    );
  },
  async down(queryInterface) {
    await queryInterface.sequelize.query(
      "ALTER TABLE Users DROP COLUMN address;"
    );
    await queryInterface.sequelize.query(
      "ALTER TABLE Users DROP COLUMN state;"
    );
  },
};
